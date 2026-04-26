import { Module } from "@nestjs/common";
import { PackagesController } from "./packages.controller";
import { PackagesService } from "./packages.service";
import { StorageModule } from "../storage/storage.module";
import { WebhooksModule } from "../webhooks/webhooks.module";
import { SecurityAlertsModule } from "../security-alerts/security-alerts.module";

@Module({
  imports: [StorageModule, WebhooksModule, SecurityAlertsModule],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
