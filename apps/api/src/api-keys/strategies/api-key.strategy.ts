import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-custom";
import { Request } from "express";
import { ApiKeysService } from "../api-keys.service";

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, "api-key") {
  constructor(private readonly apiKeysService: ApiKeysService) {
    super();
  }

  async validate(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return false;
    const raw = authHeader.slice(7);
    return this.apiKeysService.validateKey(raw);
  }
}
