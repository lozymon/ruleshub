import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
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
} from "@nestjs/swagger";
import { Request } from "express";
import { User } from "@prisma/client";
import { ApiKeysService } from "./api-keys.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("api-keys")
@Controller("api-keys")
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List API keys for the authenticated user" })
  @ApiResponse({
    status: 200,
    description: "List of API keys (no secret values)",
  })
  list(@Req() req: Request) {
    return this.apiKeysService.list((req.user as User).id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new API key — secret returned once only" })
  @ApiResponse({
    status: 201,
    description: "Created key including the raw secret",
  })
  create(@Req() req: Request, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create((req.user as User).id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Revoke an API key" })
  @ApiResponse({ status: 204, description: "Key revoked" })
  @ApiParam({ name: "id" })
  revoke(@Req() req: Request, @Param("id") id: string) {
    return this.apiKeysService.revoke((req.user as User).id, id);
  }
}
