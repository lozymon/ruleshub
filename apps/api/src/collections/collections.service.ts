import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, avatarUrl: true } }, _count: { select: { items: true } } },
    });
  }

  async findOne(username: string, slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { slug, user: { username } },
      include: {
        user: { select: { username: true, avatarUrl: true } },
        items: {
          orderBy: { addedAt: 'desc' },
          include: {
            package: {
              include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  async create(userId: string, data: { slug: string; title: string; description?: string; isPublic?: boolean }) {
    return this.prisma.collection.create({ data: { ...data, userId } });
  }

  async addItem(userId: string, username: string, slug: string, packageFullName: string) {
    const collection = await this.assertOwnership(userId, username, slug);
    const [namespace, name] = packageFullName.split('/');
    const pkg = await this.prisma.package.findUnique({ where: { namespace_name: { namespace, name } } });
    if (!pkg) throw new NotFoundException(`Package ${packageFullName} not found`);

    return this.prisma.collectionItem.upsert({
      where: { collectionId_packageId: { collectionId: collection.id, packageId: pkg.id } },
      create: { collectionId: collection.id, packageId: pkg.id },
      update: {},
    });
  }

  async removeItem(userId: string, username: string, slug: string, packageFullName: string) {
    const collection = await this.assertOwnership(userId, username, slug);
    const [namespace, name] = packageFullName.split('/');
    const pkg = await this.prisma.package.findUnique({ where: { namespace_name: { namespace, name } } });
    if (!pkg) throw new NotFoundException(`Package ${packageFullName} not found`);

    await this.prisma.collectionItem.deleteMany({
      where: { collectionId: collection.id, packageId: pkg.id },
    });
  }

  private async assertOwnership(userId: string, username: string, slug: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { slug, user: { username } },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();
    return collection;
  }
}
