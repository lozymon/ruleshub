import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPackage(namespace: string, name: string) {
    const pkg = await this.prisma.package.findUnique({ where: { namespace_name: { namespace, name } } });
    if (!pkg) throw new NotFoundException(`Package ${namespace}/${name} not found`);

    return this.prisma.comment.findMany({
      where: { packageId: pkg.id },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { username: true, avatarUrl: true, verified: true } } },
    });
  }

  async create(userId: string, namespace: string, name: string, body: string) {
    const pkg = await this.prisma.package.findUnique({ where: { namespace_name: { namespace, name } } });
    if (!pkg) throw new NotFoundException(`Package ${namespace}/${name} not found`);

    return this.prisma.comment.create({
      data: { userId, packageId: pkg.id, body },
      include: { user: { select: { username: true, avatarUrl: true, verified: true } } },
    });
  }

  async delete(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException();
    await this.prisma.comment.delete({ where: { id: commentId } });
  }
}
