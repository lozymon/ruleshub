import { Controller, Get, Param, NotFoundException } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger";
import type { UserDto } from "@ruleshub/types";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":username")
  @ApiOperation({ summary: "Get public user profile" })
  @ApiResponse({ status: 200, description: "User profile" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiParam({ name: "username" })
  async findOne(@Param("username") username: string): Promise<UserDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException(`User ${username} not found`);
    // Return only the public profile shape; the raw Prisma row exposes
    // internal fields like githubId, blocked, and updatedAt.
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      verified: user.verified,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
