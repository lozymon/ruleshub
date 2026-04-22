import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard() {
    const [topPublishers, trendingPackages, mostStarred] = await Promise.all([
      this.prisma.user.findMany({
        where: { packages: { some: { isPrivate: false } } },
        orderBy: { packages: { _count: 'desc' } },
        take: 10,
        select: {
          id: true, username: true, avatarUrl: true, verified: true,
          _count: { select: { packages: true } },
        },
      }),
      this.prisma.package.findMany({
        where: { isPrivate: false },
        orderBy: { totalDownloads: 'desc' },
        take: 10,
        include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
      }),
      this.prisma.package.findMany({
        where: { isPrivate: false },
        orderBy: { stars: 'desc' },
        take: 10,
        include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
      }),
    ]);

    return {
      topPublishers,
      trendingPackages: trendingPackages.map((p) => ({ ...p, latestVersion: p.versions[0] ?? null })),
      mostStarred: mostStarred.map((p) => ({ ...p, latestVersion: p.versions[0] ?? null })),
    };
  }
}
