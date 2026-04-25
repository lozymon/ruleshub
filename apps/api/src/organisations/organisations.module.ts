import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OrganisationsController } from "./organisations.controller";
import { OrganisationsService } from "./organisations.service";

@Module({
  imports: [PrismaModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
})
export class OrganisationsModule {}
