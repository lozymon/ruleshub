import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { OrgRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrganisationDto } from "./dto/create-organisation.dto";
import { UpdateOrganisationDto } from "./dto/update-organisation.dto";

@Injectable()
export class OrganisationsService {
  private readonly logger = new Logger(OrganisationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrganisationDto) {
    const [slugTakenByUser, slugTakenByOrg] = await Promise.all([
      this.prisma.user.findUnique({ where: { username: dto.slug } }),
      this.prisma.organisation.findUnique({ where: { slug: dto.slug } }),
    ]);
    if (slugTakenByUser || slugTakenByOrg) {
      throw new ConflictException(`The slug "${dto.slug}" is already taken`);
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await tx.organisation.create({
        data: { slug: dto.slug, displayName: dto.displayName },
      });
      await tx.orgMember.create({
        data: { orgId: org.id, userId, role: OrgRole.owner },
      });
      return this.toOrgDto({ ...org, _count: { members: 1 } });
    });
  }

  async listMyOrgs(userId: string) {
    const memberships = await this.prisma.orgMember.findMany({
      where: { userId },
      include: {
        org: { include: { _count: { select: { members: true } } } },
      },
      orderBy: { org: { createdAt: "asc" } },
    });
    return memberships.map((m) => ({
      ...this.toOrgDto(m.org),
      role: m.role as "owner" | "admin" | "member",
    }));
  }

  async findBySlug(slug: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { slug },
      include: { _count: { select: { members: true } } },
    });
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);
    return this.toOrgDto(org);
  }

  async update(userId: string, slug: string, dto: UpdateOrganisationDto) {
    await this.assertRole(userId, slug, [OrgRole.owner, OrgRole.admin]);
    const org = await this.prisma.organisation.update({
      where: { slug },
      data: { ...dto },
      include: { _count: { select: { members: true } } },
    });
    return this.toOrgDto(org);
  }

  async delete(userId: string, slug: string) {
    await this.assertRole(userId, slug, [OrgRole.owner]);
    await this.prisma.organisation.delete({ where: { slug } });
  }

  async listMembers(slug: string) {
    const org = await this.prisma.organisation.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);

    const members = await this.prisma.orgMember.findMany({
      where: { orgId: org.id },
      include: { user: true },
      orderBy: { role: "asc" },
    });

    return members.map((m) => ({
      user: {
        id: m.user.id,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
        bio: m.user.bio,
        verified: m.user.verified,
        createdAt: m.user.createdAt.toISOString(),
      },
      role: m.role as "owner" | "admin" | "member",
    }));
  }

  async addMember(requesterId: string, slug: string, username: string) {
    await this.assertRole(requesterId, slug, [OrgRole.owner, OrgRole.admin]);

    const [org, targetUser] = await Promise.all([
      this.prisma.organisation.findUnique({ where: { slug } }),
      this.prisma.user.findUnique({ where: { username } }),
    ]);
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);
    if (!targetUser)
      throw new NotFoundException(`User "${username}" not found`);

    const existing = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: org.id, userId: targetUser.id } },
    });
    if (existing)
      throw new ConflictException(`${username} is already a member`);

    await this.prisma.orgMember.create({
      data: { orgId: org.id, userId: targetUser.id, role: OrgRole.member },
    });
  }

  async updateMemberRole(
    requesterId: string,
    slug: string,
    targetUsername: string,
    role: Exclude<OrgRole, "owner">,
  ) {
    await this.assertRole(requesterId, slug, [OrgRole.owner]);

    const [org, targetUser] = await Promise.all([
      this.prisma.organisation.findUnique({ where: { slug } }),
      this.prisma.user.findUnique({ where: { username: targetUsername } }),
    ]);
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);
    if (!targetUser)
      throw new NotFoundException(`User "${targetUsername}" not found`);
    if (targetUser.id === requesterId) {
      throw new BadRequestException("Cannot change your own role");
    }

    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: org.id, userId: targetUser.id } },
    });
    if (!membership)
      throw new NotFoundException(`${targetUsername} is not a member`);

    await this.prisma.orgMember.update({
      where: { orgId_userId: { orgId: org.id, userId: targetUser.id } },
      data: { role },
    });
  }

  async removeMember(
    requesterId: string,
    slug: string,
    targetUsername: string,
  ) {
    await this.assertRole(requesterId, slug, [OrgRole.owner, OrgRole.admin]);

    const [org, targetUser] = await Promise.all([
      this.prisma.organisation.findUnique({ where: { slug } }),
      this.prisma.user.findUnique({ where: { username: targetUsername } }),
    ]);
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);
    if (!targetUser)
      throw new NotFoundException(`User "${targetUsername}" not found`);

    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: org.id, userId: targetUser.id } },
    });
    if (!membership)
      throw new NotFoundException(`${targetUsername} is not a member`);
    if (membership.role === OrgRole.owner) {
      throw new ForbiddenException("Cannot remove the org owner");
    }

    await this.prisma.orgMember.delete({
      where: { orgId_userId: { orgId: org.id, userId: targetUser.id } },
    });
  }

  async leave(userId: string, slug: string) {
    const org = await this.prisma.organisation.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);

    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: org.id, userId } },
    });
    if (!membership)
      throw new NotFoundException("You are not a member of this organisation");

    if (membership.role === OrgRole.owner) {
      const ownerCount = await this.prisma.orgMember.count({
        where: { orgId: org.id, role: OrgRole.owner },
      });
      if (ownerCount <= 1) {
        throw new BadRequestException(
          "Cannot leave — you are the only owner. Transfer ownership first or delete the organisation.",
        );
      }
    }

    await this.prisma.orgMember.delete({
      where: { orgId_userId: { orgId: org.id, userId } },
    });
  }

  async listPackages(slug: string, page: number, limit: number) {
    const org = await this.prisma.organisation.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);

    const skip = (page - 1) * limit;
    const where = { namespace: slug, isPrivate: false };

    const [packages, total] = await this.prisma.$transaction([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: { totalDownloads: "desc" },
        include: {
          versions: { orderBy: { publishedAt: "desc" }, take: 1 },
          owner: true,
        },
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      data: packages.map((p) => ({
        ...p,
        fullName: `${p.namespace}/${p.name}`,
        latestVersion: p.versions[0] ?? null,
        owner: p.owner
          ? {
              id: p.owner.id,
              username: p.owner.username,
              avatarUrl: p.owner.avatarUrl,
              bio: p.owner.bio,
              verified: p.owner.verified,
              createdAt: p.owner.createdAt.toISOString(),
            }
          : {
              id: "",
              username: p.namespace,
              avatarUrl: null,
              bio: null,
              verified: false,
              createdAt: p.createdAt.toISOString(),
            },
      })),
      total,
      page,
      limit,
    };
  }

  private async assertRole(userId: string, slug: string, allowed: OrgRole[]) {
    const org = await this.prisma.organisation.findUnique({ where: { slug } });
    if (!org) throw new NotFoundException(`Organisation "${slug}" not found`);

    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: org.id, userId } },
    });
    if (!membership || !allowed.includes(membership.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }
    return membership;
  }

  private toOrgDto(org: {
    id: string;
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    verified: boolean;
    createdAt: Date;
    _count: { members: number };
  }) {
    return {
      id: org.id,
      slug: org.slug,
      displayName: org.displayName,
      avatarUrl: org.avatarUrl,
      verified: org.verified,
      memberCount: org._count.members,
      createdAt: org.createdAt.toISOString(),
    };
  }
}
