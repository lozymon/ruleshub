import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import { User } from "@prisma/client";
import { AuthService } from "./auth.service";
import { GitHubOAuthGuard } from "./guards/github-oauth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME } from "./auth.constants";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get("github")
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: "Redirect to GitHub OAuth" })
  @ApiResponse({ status: 302, description: "Redirects to GitHub" })
  githubLogin() {
    // Guard handles the redirect
  }

  // Auth endpoints are the highest-value brute target — cap them per-IP.
  @Get("github/callback")
  @UseGuards(GitHubOAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: "GitHub OAuth callback" })
  @ApiResponse({
    status: 302,
    description: "Sets an httpOnly auth cookie and redirects to the web app",
  })
  githubCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const { accessToken } = this.authService.login(user);
    const appUrl =
      this.configService.get<string>("appUrl") ?? "http://localhost:3000";

    // Stash the JWT in an httpOnly cookie so the web app never handles
    // raw credentials. SameSite=Lax works across web ↔ api subdomains of
    // the same site (and across localhost ports in dev).
    res.cookie(AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
    });

    res.redirect(`${appUrl}/auth/callback`);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Logout — clears the auth cookie" })
  @ApiResponse({ status: 204 })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current authenticated user" })
  @ApiResponse({ status: 200, description: "Current user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  me(@Req() req: Request) {
    const user = req.user as User;
    const adminUsernames: string[] =
      this.configService.get("adminUsernames") ?? [];
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      verified: user.verified,
      isAdmin: adminUsernames.includes(user.username),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
