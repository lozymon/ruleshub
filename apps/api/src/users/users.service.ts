import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

interface UpsertGitHubUserParams {
  githubId: string;
  username: string;
  avatarUrl: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromGitHub(params: UpsertGitHubUserParams): Promise<User> {
    return this.prisma.user.upsert({
      where: { githubId: params.githubId },
      update: {
        username: params.username,
        avatarUrl: params.avatarUrl,
      },
      create: {
        githubId: params.githubId,
        username: params.username,
        avatarUrl: params.avatarUrl,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
