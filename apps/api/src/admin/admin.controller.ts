import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
import { ListAdminUsersDto } from "./dto/list-admin-users.dto";

class SetVerifiedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  verified!: boolean;
}

class SetBlockedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  blocked!: boolean;
}

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @ApiOperation({ summary: "List all users (paginated)" })
  @ApiResponse({ status: 200 })
  listUsers(@Query() query: ListAdminUsersDto) {
    return this.adminService.listUsers(
      query.page ?? 1,
      query.limit ?? 20,
      query.q,
    );
  }

  @Patch("users/:username/block")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Block or unblock a user" })
  @ApiParam({ name: "username" })
  @ApiBody({ type: SetBlockedDto })
  @ApiResponse({ status: 204 })
  setUserBlocked(
    @Param("username") username: string,
    @Body() dto: SetBlockedDto,
  ) {
    return this.adminService.setUserBlocked(username, dto.blocked);
  }

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
