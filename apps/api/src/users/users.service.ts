import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

interface UpsertGitHubUserParams {
  githubId: string;
  username: string;
  avatarUrl: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async upsertFromGitHub(params: UpsertGitHubUserParams): Promise<User> {
    // Elevate to admin when the user's GitHub ID is listed in
    // ADMIN_GITHUB_IDS. Once a User row exists with isAdmin=true the env
    // var is no longer load-bearing for them — and because we key on
    // githubId, deleting the GitHub account and re-registering the
    // username under a different account cannot re-grant admin.
    const adminIds: string[] = this.config.get("adminGithubIds") ?? [];
    const isAdmin = adminIds.includes(params.githubId);

    return this.prisma.user.upsert({
      where: { githubId: params.githubId },
      update: {
        username: params.username,
        avatarUrl: params.avatarUrl,
        // Idempotent: a previously-elevated user stays admin even if the
        // env var is later removed; a user newly added to the env list is
        // elevated on their next login.
        ...(isAdmin ? { isAdmin: true } : {}),
      },
      create: {
        githubId: params.githubId,
        username: params.username,
        avatarUrl: params.avatarUrl,
        isAdmin,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  // Invalidate every previously-issued JWT for this user without flipping
  // `blocked`. The JwtStrategy refuses tokens whose `iat` (seconds-resolution)
  // is older than `tokensInvalidAfter`. The cutoff is "now + 1s" so a token
  // issued in the same wall-clock second as this call still falls on the
  // "older" side of the comparison and is correctly revoked.
  async revokeAllTokens(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokensInvalidAfter: new Date(Date.now() + 1000) },
    });
  }
}
