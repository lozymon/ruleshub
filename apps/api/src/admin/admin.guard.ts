import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { User } from "@prisma/client";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as User | undefined;

    if (!user?.isAdmin) {
      throw new ForbiddenException("Admin access required");
    }
    return true;
  }
}
