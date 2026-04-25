import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ApiKeysController } from "./api-keys.controller";
import { ApiKeysService } from "./api-keys.service";
import { ApiKeyStrategy } from "./strategies/api-key.strategy";

@Module({
  imports: [PrismaModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyStrategy],
  exports: [ApiKeysService, ApiKeyStrategy],
})
export class ApiKeysModule {}
