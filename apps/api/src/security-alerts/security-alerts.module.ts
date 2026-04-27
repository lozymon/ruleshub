import { Module } from "@nestjs/common";
import { SecurityAlertsService } from "./security-alerts.service";
import { WebhooksModule } from "../webhooks/webhooks.module";

@Module({
  imports: [WebhooksModule],
  providers: [SecurityAlertsService],
  exports: [SecurityAlertsService],
})
export class SecurityAlertsModule {}
