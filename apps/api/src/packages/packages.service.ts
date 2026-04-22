import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import AdmZip from 'adm-zip';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SearchPackagesDto } from './dto/search-packages.dto';
import { PackageManifestSchema } from '@ruleshub/types';
import { Package, PackageVersion, Prisma } from '@prisma/client';

export type PackageWithVersion = Package & { latestVersion: PackageVersion | null };

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async search(params: SearchPackagesDto) {
    const { q, type, tag, projectType, tool, scope, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PackageWhereInput = {
      isPrivate: false,
      ...(type && { type }),
      ...(tag && { tags: { has: tag } }),
      ...(projectType && { projectTypes: { has: projectType } }),
      ...(tool && { supportedTools: { has: tool } }),
      ...(scope === 'pack' && { type: 'pack' }),
      ...(scope === 'individual' && { type: { not: 'pack' } }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalDownloads: 'desc' },
        include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      data: data.map((p) => ({ ...p, latestVersion: p.versions[0] ?? null })),
      total,
      page,
      limit,
    };
  }

  async findByFullName(namespace: string, name: string): Promise<PackageWithVersion> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
      include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
    });

    if (!pkg) throw new NotFoundException(`Package ${namespace}/${name} not found`);

    return { ...pkg, latestVersion: pkg.versions[0] ?? null };
  }

  async findVersion(namespace: string, name: string, version: string): Promise<PackageVersion> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg) throw new NotFoundException(`Package ${namespace}/${name} not found`);

    const pkgVersion = await this.prisma.packageVersion.findUnique({
      where: { packageId_version: { packageId: pkg.id, version } },
    });
    if (!pkgVersion) throw new NotFoundException(`Version ${version} not found`);

    return pkgVersion;
  }

  async publish(userId: string, fileBuffer: Buffer): Promise<PackageVersion> {
    const manifest = this.extractManifest(fileBuffer);
    const parsed = PackageManifestSchema.safeParse(manifest);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const [namespace, packageName] = parsed.data.name.split('/');

    await this.assertOwnership(userId, namespace);

    const supportedTools = parsed.data.targets ? Object.keys(parsed.data.targets) : [];

    const storageKey = `packages/${namespace}/${packageName}/${parsed.data.version}.zip`;
    await this.storage.upload(storageKey, fileBuffer, 'application/zip');

    return this.prisma.$transaction(async (tx) => {
      const pkg = await tx.package.upsert({
        where: { namespace_name: { namespace, name: packageName } },
        update: {
          description: parsed.data.description,
          tags: parsed.data.tags,
          projectTypes: parsed.data.projectTypes,
          supportedTools,
          type: parsed.data.type,
        },
        create: {
          namespace,
          name: packageName,
          type: parsed.data.type,
          description: parsed.data.description,
          tags: parsed.data.tags,
          projectTypes: parsed.data.projectTypes,
          supportedTools,
          ownerType: 'user',
          ownerUserId: userId,
        },
      });

      const existing = await tx.packageVersion.findUnique({
        where: { packageId_version: { packageId: pkg.id, version: parsed.data.version } },
      });
      if (existing) {
        throw new ConflictException(`Version ${parsed.data.version} already exists`);
      }

      return tx.packageVersion.create({
        data: {
          packageId: pkg.id,
          version: parsed.data.version,
          manifestJson: parsed.data as unknown as Prisma.InputJsonValue,
          storageKey,
        },
      });
    });
  }

  async getDownloadUrl(namespace: string, name: string, version: string): Promise<{ url: string }> {
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

  async fork(userId: string, namespace: string, name: string): Promise<Package> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    const source = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!source) throw new NotFoundException(`Package ${namespace}/${name} not found`);

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
        ownerType: 'user',
        ownerUserId: userId,
        forkedFromId: source.id,
      },
    });
  }

  async yank(userId: string, namespace: string, name: string, version: string): Promise<void> {
    await this.assertOwnership(userId, namespace);

    const pkgVersion = await this.findVersion(namespace, name, version);
    await this.prisma.packageVersion.update({
      where: { id: pkgVersion.id },
      data: { yanked: true },
    });
  }

  private extractManifest(fileBuffer: Buffer): unknown {
    try {
      const zip = new AdmZip(fileBuffer);
      const entry = zip.getEntry('ruleshub.json');
      if (!entry) throw new BadRequestException('ruleshub.json not found in zip');
      return JSON.parse(entry.getData().toString('utf-8'));
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('Invalid zip file');
    }
  }

  private async assertOwnership(userId: string, namespace: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    if (user.username === namespace) return;

    const orgMember = await this.prisma.orgMember.findFirst({
      where: { userId, org: { slug: namespace } },
    });
    if (!orgMember) {
      throw new ForbiddenException(`You do not have permission to publish under ${namespace}`);
    }
  }
}
