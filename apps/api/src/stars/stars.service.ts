import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StarsService {
  constructor(private readonly prisma: PrismaService) {}

  async star(userId: string, namespace: string, name: string): Promise<void> {
    const pkg = await this.findPackage(namespace, name);

    await this.prisma.$transaction([
      this.prisma.star.upsert({
        where: { userId_packageId: { userId, packageId: pkg.id } },
        create: { userId, packageId: pkg.id },
        update: {},
      }),
      this.prisma.package.update({
        where: { id: pkg.id },
        data: { stars: { increment: 1 } },
      }),
    ]);
  }

  async unstar(userId: string, namespace: string, name: string): Promise<void> {
    const pkg = await this.findPackage(namespace, name);

    const existing = await this.prisma.star.findUnique({
      where: { userId_packageId: { userId, packageId: pkg.id } },
    });
    if (!existing) return;

    await this.prisma.$transaction([
      this.prisma.star.delete({
        where: { userId_packageId: { userId, packageId: pkg.id } },
      }),
      this.prisma.package.update({
        where: { id: pkg.id },
        data: { stars: { decrement: 1 } },
      }),
    ]);
  }

  async isStarred(userId: string, packageId: string): Promise<boolean> {
    const star = await this.prisma.star.findUnique({
      where: { userId_packageId: { userId, packageId } },
    });
    return !!star;
  }

  private async findPackage(namespace: string, name: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg) throw new NotFoundException(`Package ${namespace}/${name} not found`);
    return pkg;
  }
}
