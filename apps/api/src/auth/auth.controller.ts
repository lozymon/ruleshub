import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GitHubOAuthGuard } from './guards/github-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('github')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'Redirect to GitHub OAuth' })
  @ApiResponse({ status: 302, description: 'Redirects to GitHub' })
  githubLogin() {
    // Guard handles the redirect
  }

  @Get('github/callback')
  @UseGuards(GitHubOAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  githubCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const { accessToken } = this.authService.login(user);
    const appUrl = this.configService.get<string>('appUrl') ?? 'http://localhost:3000';
    res.redirect(`${appUrl}/auth/callback?token=${accessToken}`);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout (client discards token)' })
  @ApiResponse({ status: 204 })
  logout() {
    // JWT is stateless — client discards the token
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@Req() req: Request) {
    return req.user;
  }
}
