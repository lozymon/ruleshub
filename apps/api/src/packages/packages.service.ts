import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import AdmZip from "adm-zip";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { SearchPackagesDto } from "./dto/search-packages.dto";
import {
  PackageManifestSchema,
  VersionDiffDto,
  DiffChange,
} from "@ruleshub/types";
import { Package, PackageVersion, User, Prisma } from "@prisma/client";
import { WebhooksService } from "../webhooks/webhooks.service";

type PackageWithIncludes = Package & {
  versions: PackageVersion[];
  owner: User | null;
};

function computeQualityScore(
  pkg: Package,
  versionCount: number,
  hasReadme: boolean,
): number {
  let score = 0;
  if (hasReadme) score += 30;
  if (pkg.description.length >= 50) score += 15;
  if (pkg.tags.length >= 1) score += 10;
  if (pkg.projectTypes.length >= 1) score += 10;
  if (pkg.supportedTools.length >= 1) score += 10;
  if (versionCount >= 2) score += 15;
  if (pkg.totalDownloads >= 10) score += 10;
  return score;
}

export type PackageWithVersion = Package & {
  latestVersion: PackageVersion | null;
};

function toPackageDto(p: PackageWithIncludes) {
  return {
    ...p,
    fullName: `${p.namespace}/${p.name}`,
    latestVersion: p.versions[0] ?? null,
    versions: p.versions,
    owner: p.owner
      ? {
          id: p.owner.id,
          username: p.owner.username,
          avatarUrl: p.owner.avatarUrl,
          bio: p.owner.bio,
          verified: p.owner.verified,
          createdAt: p.owner.createdAt,
        }
      : {
          id: "",
          username: p.namespace,
          avatarUrl: null,
          bio: null,
          verified: false,
          createdAt: p.createdAt,
        },
  };
}

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly webhooks: WebhooksService,
  ) {}

  async search(params: SearchPackagesDto) {
    const {
      q,
      type,
      tag,
      projectType,
      tool,
      scope,
      namespace,
      sort,
      page = 1,
      limit = 20,
    } = params;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.PackageOrderByWithRelationInput =
      sort === "newest"
        ? { createdAt: "desc" }
        : sort === "mostStarred"
          ? { stars: "desc" }
          : { totalDownloads: "desc" };

    const where: Prisma.PackageWhereInput = {
      isPrivate: false,
      ...(namespace && { namespace }),
      ...(type && { type }),
      ...(tag && { tags: { has: tag } }),
      ...(projectType && { projectTypes: { has: projectType } }),
      ...(tool && { supportedTools: { has: tool } }),
      ...(scope === "pack" && { type: "pack" }),
      ...(scope === "individual" && { type: { not: "pack" } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          versions: { orderBy: { publishedAt: "desc" }, take: 1 },
          owner: true,
        },
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      data: data.map(toPackageDto),
      total,
      page,
      limit,
    };
  }

  async findByFullName(namespace: string, name: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
      include: {
        versions: { orderBy: { publishedAt: "desc" } },
        owner: true,
      },
    });

    if (!pkg)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    return toPackageDto(pkg);
  }

  async findVersion(
    namespace: string,
    name: string,
    version: string,
  ): Promise<PackageVersion> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    const pkgVersion = await this.prisma.packageVersion.findUnique({
      where: { packageId_version: { packageId: pkg.id, version } },
    });
    if (!pkgVersion)
      throw new NotFoundException(`Version ${version} not found`);

    return pkgVersion;
  }

  async publish(userId: string, fileBuffer: Buffer): Promise<PackageVersion> {
    const manifest = this.extractManifest(fileBuffer);
    const parsed = PackageManifestSchema.safeParse(manifest);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const [namespace] = parsed.data.name.split("/");
    await this.assertOwnership(userId, namespace);

    return this.doPublish(userId, fileBuffer);
  }

  // Used by the GitHub import webhook — ownership already validated at import setup time
  async publishFromWebhook(
    ownerUserId: string,
    fileBuffer: Buffer,
  ): Promise<PackageVersion> {
    return this.doPublish(ownerUserId, fileBuffer);
  }

  private async doPublish(
    ownerUserId: string,
    fileBuffer: Buffer,
  ): Promise<PackageVersion> {
    const manifest = this.extractManifest(fileBuffer);
    const parsed = PackageManifestSchema.safeParse(manifest);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const [namespace, packageName] = parsed.data.name.split("/");
    const supportedTools = parsed.data.targets
      ? Object.keys(parsed.data.targets)
      : [];
    const hasReadme = this.extractHasReadme(fileBuffer);

    const storageKey = `packages/${namespace}/${packageName}/${parsed.data.version}.zip`;
    await this.storage.upload(storageKey, fileBuffer, "application/zip");

    return this.prisma.$transaction(async (tx) => {
      const pkg = await tx.package.upsert({
        where: { namespace_name: { namespace, name: packageName } },
        update: {
          description: parsed.data.description,
          tags: parsed.data.tags,
          projectTypes: parsed.data.projectTypes,
          supportedTools,
          type: parsed.data.type,
          hasReadme,
        },
        create: {
          namespace,
          name: packageName,
          type: parsed.data.type,
          description: parsed.data.description,
          tags: parsed.data.tags,
          projectTypes: parsed.data.projectTypes,
          supportedTools,
          hasReadme,
          ownerType: "user",
          ownerUserId,
        },
      });

      const existing = await tx.packageVersion.findUnique({
        where: {
          packageId_version: {
            packageId: pkg.id,
            version: parsed.data.version,
          },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Version ${parsed.data.version} already exists`,
        );
      }

      const version = await tx.packageVersion.create({
        data: {
          packageId: pkg.id,
          version: parsed.data.version,
          changelog: parsed.data.changelog ?? null,
          manifestJson: parsed.data as unknown as Prisma.InputJsonValue,
          storageKey,
        },
      });

      const versionCount = await tx.packageVersion.count({
        where: { packageId: pkg.id },
      });
      const qualityScore = computeQualityScore(pkg, versionCount, hasReadme);
      await tx.package.update({
        where: { id: pkg.id },
        data: { qualityScore },
      });

      this.webhooks.fireForPackage(
        "package.version.published",
        pkg.id,
        `${namespace}/${packageName}`,
        version.version,
      );

      return version;
    });
  }

  async getDownloadUrl(
    namespace: string,
    name: string,
    version: string,
  ): Promise<{ url: string }> {
    const pkgVersion = await this.findVersion(namespace, name, version);

    if (pkgVersion.yanked) {
      throw new BadRequestException(`Version ${version} has been yanked`);
    }

    await this.prisma.$transaction([
      this.prisma.packageVersion.update({
        where: { id: pkgVersion.id },
        data: { downloads: { increment: 1 } },
      }),
      this.prisma.package.update({
        where: { namespace_name: { namespace, name } },
        data: { totalDownloads: { increment: 1 } },
      }),
    ]);

    const url = await this.storage.getSignedUrl(pkgVersion.storageKey);
    return { url };
  }

  async fork(
    userId: string,
    namespace: string,
    name: string,
  ): Promise<Package> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException("User not found");

    const source = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!source)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    const existing = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace: user.username, name } },
    });
    if (existing) {
      throw new ConflictException(`You already have a package named ${name}`);
    }

    return this.prisma.package.create({
      data: {
        namespace: user.username,
        name,
        type: source.type,
        description: source.description,
        tags: source.tags,
        projectTypes: source.projectTypes,
        supportedTools: source.supportedTools,
        ownerType: "user",
        ownerUserId: userId,
        forkedFromId: source.id,
      },
    });
  }

  async yank(
    userId: string,
    namespace: string,
    name: string,
    version: string,
  ): Promise<void> {
    await this.assertOwnership(userId, namespace);

    const pkgVersion = await this.findVersion(namespace, name, version);
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });

    await this.prisma.packageVersion.update({
      where: { id: pkgVersion.id },
      data: { yanked: true },
    });

    if (pkg) {
      this.webhooks.fireForPackage(
        "package.version.yanked",
        pkg.id,
        `${namespace}/${name}`,
        version,
      );
    }
  }

  private extractManifest(fileBuffer: Buffer): unknown {
    try {
      const zip = new AdmZip(fileBuffer);
      const entry = zip.getEntry("ruleshub.json");
      if (!entry)
        throw new BadRequestException("ruleshub.json not found in zip");
      return JSON.parse(entry.getData().toString("utf-8"));
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException("Invalid zip file");
    }
  }

  private extractHasReadme(fileBuffer: Buffer): boolean {
    try {
      const zip = new AdmZip(fileBuffer);
      return !!(zip.getEntry("README.md") ?? zip.getEntry("readme.md"));
    } catch {
      return false;
    }
  }

  async diffVersions(
    namespace: string,
    name: string,
    from: string,
    to: string,
  ): Promise<VersionDiffDto> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    const [fromVersion, toVersion] = await Promise.all([
      this.prisma.packageVersion.findUnique({
        where: { packageId_version: { packageId: pkg.id, version: from } },
      }),
      this.prisma.packageVersion.findUnique({
        where: { packageId_version: { packageId: pkg.id, version: to } },
      }),
    ]);

    if (!fromVersion) throw new NotFoundException(`Version ${from} not found`);
    if (!toVersion) throw new NotFoundException(`Version ${to} not found`);

    const fromManifest = fromVersion.manifestJson as Record<string, unknown>;
    const toManifest = toVersion.manifestJson as Record<string, unknown>;

    return { from, to, changes: this.buildDiff(fromManifest, toManifest) };
  }

  private buildDiff(
    from: Record<string, unknown>,
    to: Record<string, unknown>,
  ): DiffChange[] {
    const changes: DiffChange[] = [];

    for (const field of ["type", "description", "license"] as const) {
      const fv = from[field] ?? null;
      const tv = to[field] ?? null;
      changes.push({
        field,
        kind: fv === tv ? "unchanged" : "changed",
        fromValue: fv,
        toValue: tv,
      });
    }

    for (const field of ["tags", "projectTypes"] as const) {
      const fArr = (from[field] as string[]) ?? [];
      const tArr = (to[field] as string[]) ?? [];
      const unchanged =
        fArr.length === tArr.length && fArr.every((v) => tArr.includes(v));
      changes.push({
        field,
        kind: unchanged ? "unchanged" : "changed",
        fromValue: fArr,
        toValue: tArr,
      });
    }

    const fromTargets =
      (from["targets"] as Record<string, { file: string }>) ?? {};
    const toTargets = (to["targets"] as Record<string, { file: string }>) ?? {};
    const allTools = new Set([
      ...Object.keys(fromTargets),
      ...Object.keys(toTargets),
    ]);

    for (const tool of allTools) {
      const fPath = fromTargets[tool]?.file ?? null;
      const tPath = toTargets[tool]?.file ?? null;
      const kind =
        fPath === null
          ? "added"
          : tPath === null
            ? "removed"
            : fPath !== tPath
              ? "changed"
              : "unchanged";
      changes.push({
        field: `targets.${tool}`,
        kind,
        fromValue: fPath,
        toValue: tPath,
      });
    }

    const fCl = from["changelog"] ?? null;
    const tCl = to["changelog"] ?? null;
    changes.push({
      field: "changelog",
      kind: fCl === tCl ? "unchanged" : "changed",
      fromValue: fCl,
      toValue: tCl,
    });

    return changes;
  }

  private async assertOwnership(
    userId: string,
    namespace: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException("User not found");

    if (user.username === namespace) return;

    const orgMember = await this.prisma.orgMember.findFirst({
      where: { userId, org: { slug: namespace } },
    });
    if (!orgMember) {
      throw new ForbiddenException(
        `You do not have permission to publish under ${namespace}`,
      );
    }
  }
}
