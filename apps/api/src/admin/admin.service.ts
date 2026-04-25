import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AdminUserDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  verified: boolean;
  blocked: boolean;
  packageCount: number;
  createdAt: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const where = q
      ? { username: { contains: q, mode: "insensitive" as const } }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { packages: true } } },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(
        (u): AdminUserDto => ({
          id: u.id,
          username: u.username,
          avatarUrl: u.avatarUrl,
          verified: u.verified,
          blocked: u.blocked,
          packageCount: u._count.packages,
          createdAt: u.createdAt.toISOString(),
        }),
      ),
      total,
      page,
      limit,
    };
  }

  async setUserVerified(username: string, verified: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException(`User ${username} not found`);
    await this.prisma.user.update({ where: { username }, data: { verified } });
  }

  async setUserBlocked(username: string, blocked: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException(`User ${username} not found`);
    await this.prisma.user.update({ where: { username }, data: { blocked } });
  }

  async setOrgVerified(slug: string, verified: boolean): Promise<void> {
    const org = await this.prisma.organisation.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException(`Organisation ${slug} not found`);
    await this.prisma.organisation.update({
      where: { slug },
      data: { verified },
    });
  }
}
