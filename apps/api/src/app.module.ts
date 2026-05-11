import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { StorageModule } from "./storage/storage.module";
import { PackagesModule } from "./packages/packages.module";
import { StarsModule } from "./stars/stars.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { CollectionsModule } from "./collections/collections.module";
import { CommentsModule } from "./comments/comments.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { OrganisationsModule } from "./organisations/organisations.module";
import { ApiKeysModule } from "./api-keys/api-keys.module";
import { BadgesModule } from "./badges/badges.module";
import { ImportsModule } from "./imports/imports.module";
import { AdminModule } from "./admin/admin.module";
import { WebhooksModule } from "./webhooks/webhooks.module";
import { SecurityAlertsModule } from "./security-alerts/security-alerts.module";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // Global rate limit, applied via ThrottlerGuard below. Sensitive
    // endpoints (auth callback, webhook ping, publish, fork) tighten with
    // `@Throttle({...})`. In-memory storage is fine for a single instance;
    // a multi-instance deploy should swap in Redis storage.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (config.get<string>("DISABLE_THROTTLER") === "true") {
          return [{ name: "default", ttl: 60_000, limit: 1_000_000 }];
        }
        return [{ name: "default", ttl: 60_000, limit: 600 }];
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    StorageModule,
    PackagesModule,
    StarsModule,
    RecommendationsModule,
    CollectionsModule,
    CommentsModule,
    LeaderboardModule,
    OrganisationsModule,
    ApiKeysModule,
    BadgesModule,
    ImportsModule,
    AdminModule,
    WebhooksModule,
    SecurityAlertsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
