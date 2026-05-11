import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AdmZip = require("adm-zip");
import { createHash } from "crypto";
import { Readable } from "stream";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { SearchPackagesDto } from "./dto/search-packages.dto";
import {
  PackageManifestSchema,
  VersionDiffDto,
  DiffChange,
  type PackageManifest,
  type PackageVersionPreviewDto,
} from "@ruleshub/types";
import {
  Package,
  PackageVersion,
  User,
  PackageDependency,
  OrgRole,
  Prisma,
} from "@prisma/client";
import { WebhooksService } from "../webhooks/webhooks.service";
import { SecurityAlertsService } from "../security-alerts/security-alerts.service";

type DepWithPackage = PackageDependency & {
  dep: Package & { versions: PackageVersion[] };
};

type PackageWithIncludes = Package & {
  versions: PackageVersion[];
  owner: User | null;
  packDependencies: DepWithPackage[];
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

const packDepsInclude = {
  packDependencies: {
    include: {
      dep: {
        include: {
          versions: { orderBy: { publishedAt: "desc" as const }, take: 1 },
        },
      },
    },
  },
} as const;

function toPackageDto(p: PackageWithIncludes) {
  return {
    ...p,
    fullName: `${p.namespace}/${p.name}`,
    latestVersion: p.versions[0] ?? null,
    versions: p.versions,
    includes: p.packDependencies.map((d) => ({
      fullName: `${d.dep.namespace}/${d.dep.name}`,
      namespace: d.dep.namespace,
      name: d.dep.name,
      type: d.dep.type,
      description: d.dep.description,
      versionRange: d.versionRange,
      latestVersion: d.dep.versions[0]?.version ?? null,
    })),
    owner: p.owner
      ? {
          id: p.owner.id,
          username: p.owner.username,
          avatarUrl: p.owner.avatarUrl,
          bio: p.owner.bio,
          verified: p.owner.verified,
          isAdmin: p.owner.isAdmin,
          createdAt: p.owner.createdAt.toISOString(),
        }
      : {
          id: "",
          username: p.namespace,
          avatarUrl: null,
          bio: null,
          verified: false,
          isAdmin: false,
          createdAt: p.createdAt.toISOString(),
        },
  };
}

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly webhooks: WebhooksService,
    private readonly securityAlerts: SecurityAlertsService,
    private readonly config: ConfigService,
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
          ...packDepsInclude,
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

  async findByFullName(namespace: string, name: string, requesterId?: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
      include: {
        versions: { orderBy: { publishedAt: "desc" } },
        owner: true,
        ...packDepsInclude,
      },
    });

    if (!pkg)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    await this.assertCanReadPackage(pkg, requesterId);

    return toPackageDto(pkg);
  }

  async findVersion(
    namespace: string,
    name: string,
    version: string,
    requesterId?: string,
  ): Promise<PackageVersion> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    await this.assertCanReadPackage(pkg, requesterId);

    const pkgVersion = await this.prisma.packageVersion.findUnique({
      where: { packageId_version: { packageId: pkg.id, version } },
    });
    if (!pkgVersion)
      throw new NotFoundException(`Version ${version} not found`);

    return pkgVersion;
  }

  async publish(
    userId: string,
    fileBuffer: Buffer,
    manifestData: unknown,
  ): Promise<PackageVersion> {
    const parsed = PackageManifestSchema.safeParse(manifestData);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const [namespace] = parsed.data.name.split("/");
    await this.assertOwnership(userId, namespace);

    return this.doPublish(userId, fileBuffer, parsed.data);
  }

  // Used by the GitHub import webhook — ownership already validated at import setup time
  async publishFromWebhook(
    ownerUserId: string,
    fileBuffer: Buffer,
  ): Promise<PackageVersion> {
    const manifest = this.extractManifest(fileBuffer);
    const parsed = PackageManifestSchema.safeParse(manifest);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.doPublish(ownerUserId, fileBuffer, parsed.data);
  }

  private async doPublish(
    ownerUserId: string,
    fileBuffer: Buffer,
    manifest: PackageManifest,
  ): Promise<PackageVersion> {
    const [namespace, packageName] = manifest.name.split("/");
    const supportedTools = manifest.targets
      ? Object.keys(manifest.targets)
      : [];

    // Ensure ruleshub.json is present in the stored zip
    const enrichedBuffer = this.injectManifest(fileBuffer, manifest);
    const hasReadme = this.extractHasReadme(enrichedBuffer);
    // Hash the exact bytes we're about to store — surfaced via the
    // download envelope so clients can verify the artifact they fetch
    // is the one the registry shipped.
    const sha256 = createHash("sha256").update(enrichedBuffer).digest("hex");

    const storageKey = `packages/${namespace}/${packageName}/${manifest.version}.zip`;
    await this.storage.upload(storageKey, enrichedBuffer, "application/zip");

    return this.prisma.$transaction(async (tx) => {
      const pkg = await tx.package.upsert({
        where: { namespace_name: { namespace, name: packageName } },
        update: {
          description: manifest.description,
          tags: manifest.tags,
          projectTypes: manifest.projectTypes,
          supportedTools,
          type: manifest.type,
          hasReadme,
        },
        create: {
          namespace,
          name: packageName,
          type: manifest.type,
          description: manifest.description,
          tags: manifest.tags,
          projectTypes: manifest.projectTypes,
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
            version: manifest.version,
          },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Version ${manifest.version} already exists`,
        );
      }

      const version = await tx.packageVersion.create({
        data: {
          packageId: pkg.id,
          version: manifest.version,
          changelog: manifest.changelog ?? null,
          manifestJson: manifest as unknown as Prisma.InputJsonValue,
          storageKey,
          sha256,
        },
      });

      if (manifest.type === "pack" && manifest.includes?.length) {
        const depIds = await this.resolveIncludes(manifest.includes);
        await tx.packageDependency.deleteMany({ where: { packId: pkg.id } });
        await tx.packageDependency.createMany({
          data: depIds.map(({ depId, versionRange }) => ({
            packId: pkg.id,
            depId,
            versionRange,
          })),
        });
      }

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

  private async resolveIncludes(
    includes: string[],
  ): Promise<{ depId: string; versionRange: string }[]> {
    return Promise.all(
      includes.map(async (entry) => {
        const atIdx = entry.lastIndexOf("@");
        const hasVersion = atIdx > 0;
        const fullName = hasVersion ? entry.slice(0, atIdx) : entry;
        const versionRange = hasVersion ? entry.slice(atIdx + 1) : "*";
        const [ns, pkgName] = fullName.split("/");
        if (!ns || !pkgName) {
          throw new BadRequestException(
            `Invalid include entry "${entry}" — expected namespace/name or namespace/name@range`,
          );
        }
        const dep = await this.prisma.package.findUnique({
          where: { namespace_name: { namespace: ns, name: pkgName } },
        });
        if (!dep) {
          throw new BadRequestException(
            `Included package "${fullName}" not found — publish it first`,
          );
        }
        return { depId: dep.id, versionRange };
      }),
    );
  }

  async getDownloadUrl(
    namespace: string,
    name: string,
    version: string,
    requestBaseUrl?: string,
    requesterId?: string,
  ): Promise<{ url: string; sha256: string | null }> {
    const pkgVersion = await this.findVersion(
      namespace,
      name,
      version,
      requesterId,
    );

    if (pkgVersion.yanked) {
      throw new BadRequestException(`Version ${version} has been yanked`);
    }

    // Prefer the request's own origin so the URL we hand back is whatever
    // host the client used to reach us (api.ruleshub.dev in prod,
    // localhost:3001 in dev) — no per-deploy env coordination needed.
    // Fall back to the API_URL env var, then to a localhost default.
    const base = (
      requestBaseUrl ??
      this.config.get<string>("apiUrl") ??
      "http://localhost:3001/v1"
    ).replace(/\/$/, "");
    const url = `${base}/packages/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}/${encodeURIComponent(version)}/file`;
    // sha256 is null for versions published before the column existed —
    // clients should treat null as "unverifiable" and decide what to do.
    return { url, sha256: pkgVersion.sha256 };
  }

  async streamFile(
    namespace: string,
    name: string,
    version: string,
    requesterId?: string,
  ): Promise<{ stream: Readable; filename: string }> {
    const pkgVersion = await this.findVersion(
      namespace,
      name,
      version,
      requesterId,
    );

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

    const stream = await this.storage.download(pkgVersion.storageKey);
    return { stream, filename: `${name}-${version}.zip` };
  }

  async getFilePreview(
    namespace: string,
    name: string,
    version: string,
    requesterId?: string,
  ): Promise<PackageVersionPreviewDto> {
    const pkgVersion = await this.findVersion(
      namespace,
      name,
      version,
      requesterId,
    );

    if (pkgVersion.yanked) {
      throw new BadRequestException(`Version ${version} has been yanked`);
    }

    const manifest = PackageManifestSchema.safeParse(pkgVersion.manifestJson);

    const stream = await this.storage.download(pkgVersion.storageKey);
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });
    const zipBuffer = Buffer.concat(chunks);
    const zip = new AdmZip(zipBuffer);

    const targets =
      manifest.success && manifest.data.targets ? manifest.data.targets : {};
    const targetPaths = new Set(Object.values(targets).map((t) => t.file));
    const toolByPath = Object.fromEntries(
      Object.entries(targets).map(([tool, t]) => [t.file, tool]),
    );

    // Target files first, then remaining files alphabetically (skip ruleshub.json)
    const allEntries = zip
      .getEntries()
      .filter((e) => !e.isDirectory && e.entryName !== "ruleshub.json");

    const targetEntries = allEntries.filter((e) =>
      targetPaths.has(e.entryName),
    );
    const otherEntries = allEntries
      .filter((e) => !targetPaths.has(e.entryName))
      .sort((a, b) => a.entryName.localeCompare(b.entryName));

    const previews = [...targetEntries, ...otherEntries].map((entry) => ({
      tool: toolByPath[entry.entryName] ?? null,
      path: entry.entryName,
      content: entry.getData().toString("utf-8"),
      isTarget: targetPaths.has(entry.entryName),
    }));

    return { version, previews };
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

    await this.assertCanReadPackage(source, userId);

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
      this.securityAlerts.notifyDependents(
        pkg.id,
        `${namespace}/${name}`,
        version,
      );
    }
  }

  private injectManifest(fileBuffer: Buffer, manifest: unknown): Buffer {
    try {
      const zip = new AdmZip(fileBuffer);
      const existing = zip.getEntry("ruleshub.json");
      if (existing) zip.deleteFile("ruleshub.json");
      zip.addFile(
        "ruleshub.json",
        Buffer.from(JSON.stringify(manifest, null, 2), "utf-8"),
      );
      return zip.toBuffer();
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException("Invalid zip file");
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
    requesterId?: string,
  ): Promise<VersionDiffDto> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg)
      throw new NotFoundException(`Package ${namespace}/${name} not found`);

    await this.assertCanReadPackage(pkg, requesterId);

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

  // Throws NotFoundException (not Forbidden) when a private package is
  // accessed by a non-owner — keeps existence of private packages opaque.
  private async assertCanReadPackage(
    pkg: {
      isPrivate: boolean;
      ownerUserId: string | null;
      ownerOrgId: string | null;
      namespace: string;
      name: string;
    },
    requesterId?: string,
  ): Promise<void> {
    if (!pkg.isPrivate) return;
    if (!requesterId) {
      throw new NotFoundException(
        `Package ${pkg.namespace}/${pkg.name} not found`,
      );
    }
    if (pkg.ownerUserId && pkg.ownerUserId === requesterId) return;
    if (pkg.ownerOrgId) {
      const member = await this.prisma.orgMember.findFirst({
        where: { orgId: pkg.ownerOrgId, userId: requesterId },
        select: { userId: true },
      });
      if (member) return;
    }
    throw new NotFoundException(
      `Package ${pkg.namespace}/${pkg.name} not found`,
    );
  }

  private async assertOwnership(
    userId: string,
    namespace: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException("User not found");

    if (user.username === namespace) return;

    const orgMember = await this.prisma.orgMember.findFirst({
      where: {
        userId,
        org: { slug: namespace },
        role: { in: [OrgRole.owner, OrgRole.admin] },
      },
    });
    if (!orgMember) {
      throw new ForbiddenException(
        `You do not have permission to publish under ${namespace}`,
      );
    }
  }
}
