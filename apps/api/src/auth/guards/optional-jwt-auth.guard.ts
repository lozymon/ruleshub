import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Like JwtAuthGuard, but does not reject anonymous requests.
// Populates req.user when a valid JWT or API key is supplied; leaves it
// undefined otherwise so handlers can decide whether to grant access.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard(["jwt", "api-key"]) {
  handleRequest<TUser>(_err: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
