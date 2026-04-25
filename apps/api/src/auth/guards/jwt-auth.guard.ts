import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Accepts both a signed JWT and a long-lived API key (rhk_ prefix)
@Injectable()
export class JwtAuthGuard extends AuthGuard(["jwt", "api-key"]) {}
