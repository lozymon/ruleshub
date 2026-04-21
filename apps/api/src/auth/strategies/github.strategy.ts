import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('auth.github.clientId') ?? '',
      clientSecret: configService.get<string>('auth.github.clientSecret') ?? '',
      callbackURL: configService.get<string>('auth.github.callbackUrl') ?? '',
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      username: string;
      photos?: { value: string }[];
    },
  ) {
    return this.usersService.upsertFromGitHub({
      githubId: profile.id,
      username: profile.username,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    });
  }
}
