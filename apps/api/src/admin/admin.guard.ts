import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { User } from "@prisma/client";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as User | undefined;
    const admins: string[] = this.config.get("adminUsernames") ?? [];

    if (!user || !admins.includes(user.username)) {
      throw new ForbiddenException("Admin access required");
    }
    return true;
  }
}
