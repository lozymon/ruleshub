import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { UsersService } from "../../users/users.service";
import { AUTH_COOKIE_NAME, requireJwtSecret } from "../auth.constants";

interface JwtPayload {
  sub: string;
  username: string;
}

function fromAuthCookie(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[AUTH_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromAuthCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(configService),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    if (user.blocked) throw new UnauthorizedException("Account is blocked");
    return user;
  }
}
