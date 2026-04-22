import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(projectType?: string, tool?: string) {
    const where = {
      isPrivate: false,
      ...(projectType && { projectTypes: { has: projectType } }),
      ...(tool && { supportedTools: { has: tool } }),
    };

    const [packs, individuals] = await Promise.all([
      this.prisma.package.findMany({
        where: { ...where, type: 'pack' },
        orderBy: { stars: 'desc' },
        take: 5,
        include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
      }),
      this.prisma.package.findMany({
        where: { ...where, type: { not: 'pack' } },
        orderBy: { totalDownloads: 'desc' },
        take: 10,
        include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
      }),
    ]);

    return {
      packs: packs.map((p) => ({ ...p, latestVersion: p.versions[0] ?? null })),
      individuals: individuals.map((p) => ({ ...p, latestVersion: p.versions[0] ?? null })),
    };
  }
}
