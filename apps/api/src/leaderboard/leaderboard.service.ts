import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Package, PackageVersion, User } from "@prisma/client";

type PackageWithIncludes = Package & {
  versions: PackageVersion[];
  owner: User | null;
};

function toPackageDto(p: PackageWithIncludes) {
  return {
    ...p,
    fullName: `${p.namespace}/${p.name}`,
    latestVersion: p.versions[0] ?? null,
    includes: [],
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
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard() {
    const [topPublishers, trendingPackages, mostStarred] = await Promise.all([
      this.prisma.user.findMany({
        where: { packages: { some: { isPrivate: false } } },
        orderBy: { packages: { _count: "desc" } },
        take: 10,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          verified: true,
          _count: { select: { packages: true } },
        },
      }),
      this.prisma.package.findMany({
        where: { isPrivate: false },
        orderBy: { totalDownloads: "desc" },
        take: 10,
        include: {
          versions: { orderBy: { publishedAt: "desc" }, take: 1 },
          owner: true,
        },
      }),
      this.prisma.package.findMany({
        where: { isPrivate: false },
        orderBy: { stars: "desc" },
        take: 10,
        include: {
          versions: { orderBy: { publishedAt: "desc" }, take: 1 },
          owner: true,
        },
      }),
    ]);

    return {
      topPublishers,
      trendingPackages: trendingPackages.map(toPackageDto),
      mostStarred: mostStarred.map(toPackageDto),
    };
  }
}
