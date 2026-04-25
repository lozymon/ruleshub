import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiProperty,
} from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

class SetVerifiedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  verified: boolean;
}

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Patch("users/:username/verify")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Set verified status on a publisher" })
  @ApiParam({ name: "username" })
  @ApiBody({ type: SetVerifiedDto })
  @ApiResponse({ status: 204 })
  setUserVerified(
    @Param("username") username: string,
    @Body() dto: SetVerifiedDto,
  ) {
    return this.adminService.setUserVerified(username, dto.verified);
  }

  @Patch("orgs/:slug/verify")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Set verified status on an organisation" })
  @ApiParam({ name: "slug" })
  @ApiBody({ type: SetVerifiedDto })
  @ApiResponse({ status: 204 })
  setOrgVerified(@Param("slug") slug: string, @Body() dto: SetVerifiedDto) {
    return this.adminService.setOrgVerified(slug, dto.verified);
  }
}
