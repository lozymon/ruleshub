import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
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
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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
  ],
})
export class AppModule {}
