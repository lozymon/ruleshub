import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async setUserVerified(username: string, verified: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException(`User ${username} not found`);
    await this.prisma.user.update({ where: { username }, data: { verified } });
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
