import { Module } from "@nestjs/common";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";
import { PackagesModule } from "../packages/packages.module";

@Module({
  imports: [PackagesModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
