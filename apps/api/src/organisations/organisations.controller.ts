import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
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
  ApiQuery,
} from "@nestjs/swagger";
import { Request } from "express";
import { User } from "@prisma/client";
import { OrganisationsService } from "./organisations.service";
import { CreateOrganisationDto } from "./dto/create-organisation.dto";
import { UpdateOrganisationDto } from "./dto/update-organisation.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("organisations")
@Controller("orgs")
export class OrganisationsController {
  constructor(private readonly orgsService: OrganisationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create an organisation" })
  @ApiResponse({ status: 201, description: "Organisation created" })
  @ApiResponse({ status: 409, description: "Slug already taken" })
  create(@Req() req: Request, @Body() dto: CreateOrganisationDto) {
    return this.orgsService.create((req.user as User).id, dto);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List organisations the authenticated user belongs to",
  })
  @ApiResponse({ status: 200, description: "User organisation memberships" })
  listMine(@Req() req: Request) {
    return this.orgsService.listMyOrgs((req.user as User).id);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get organisation public profile" })
  @ApiResponse({ status: 200, description: "Organisation profile" })
  @ApiResponse({ status: 404, description: "Organisation not found" })
  @ApiParam({ name: "slug" })
  findOne(@Param("slug") slug: string) {
    return this.orgsService.findBySlug(slug);
  }

  @Patch(":slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update organisation (owner or admin)" })
  @ApiResponse({ status: 200, description: "Updated organisation" })
  @ApiParam({ name: "slug" })
  update(
    @Req() req: Request,
    @Param("slug") slug: string,
    @Body() dto: UpdateOrganisationDto,
  ) {
    return this.orgsService.update((req.user as User).id, slug, dto);
  }

  @Delete(":slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete organisation (owner only)" })
  @ApiResponse({ status: 204, description: "Deleted" })
  @ApiParam({ name: "slug" })
  remove(@Req() req: Request, @Param("slug") slug: string) {
    return this.orgsService.delete((req.user as User).id, slug);
  }

  @Get(":slug/members")
  @ApiOperation({ summary: "List organisation members" })
  @ApiResponse({ status: 200, description: "Member list" })
  @ApiParam({ name: "slug" })
  listMembers(@Param("slug") slug: string) {
    return this.orgsService.listMembers(slug);
  }

  @Post(":slug/members")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Invite a member (owner or admin)" })
  @ApiResponse({ status: 204, description: "Member added" })
  @ApiResponse({ status: 409, description: "Already a member" })
  @ApiParam({ name: "slug" })
  addMember(
    @Req() req: Request,
    @Param("slug") slug: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.orgsService.addMember(
      (req.user as User).id,
      slug,
      dto.username,
    );
  }

  // 'me' must be declared before ':username' to avoid route conflict
  @Delete(":slug/members/me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Leave organisation" })
  @ApiResponse({ status: 204, description: "Left organisation" })
  @ApiParam({ name: "slug" })
  leave(@Req() req: Request, @Param("slug") slug: string) {
    return this.orgsService.leave((req.user as User).id, slug);
  }

  @Patch(":slug/members/:username")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Update member role (owner only)" })
  @ApiResponse({ status: 204, description: "Role updated" })
  @ApiParam({ name: "slug" })
  @ApiParam({ name: "username" })
  updateMemberRole(
    @Req() req: Request,
    @Param("slug") slug: string,
    @Param("username") username: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.orgsService.updateMemberRole(
      (req.user as User).id,
      slug,
      username,
      dto.role,
    );
  }

  @Delete(":slug/members/:username")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a member (owner or admin)" })
  @ApiResponse({ status: 204, description: "Member removed" })
  @ApiParam({ name: "slug" })
  @ApiParam({ name: "username" })
  removeMember(
    @Req() req: Request,
    @Param("slug") slug: string,
    @Param("username") username: string,
  ) {
    return this.orgsService.removeMember((req.user as User).id, slug, username);
  }

  @Get(":slug/packages")
  @ApiOperation({ summary: "List packages published under an organisation" })
  @ApiResponse({ status: 200, description: "Paginated package list" })
  @ApiParam({ name: "slug" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  listPackages(
    @Param("slug") slug: string,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    return this.orgsService.listPackages(slug, Number(page), Number(limit));
  }
}
