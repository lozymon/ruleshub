import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Headers,
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
import { RawBodyRequest } from "@nestjs/common";
import { Request } from "express";
import { User } from "@prisma/client";
import { ImportsService } from "./imports.service";
import { CreateImportDto } from "./dto/create-import.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("imports")
@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register a GitHub repo for auto-publishing" })
  @ApiResponse({
    status: 201,
    description: "Import created — webhook secret shown once",
  })
  create(@Body() dto: CreateImportDto, @Req() req: Request) {
    const user = req.user as User;
    return this.importsService.create(user.id, dto);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List GitHub imports for the current user" })
  @ApiResponse({ status: 200, description: "List of imports" })
  findMine(@Req() req: Request) {
    const user = req.user as User;
    return this.importsService.findMine(user.id);
  }

  @Delete(":namespace/:name")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Disconnect a GitHub repo from a package" })
  @ApiParam({ name: "namespace" })
  @ApiParam({ name: "name" })
  @ApiResponse({ status: 204 })
  remove(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.importsService.remove(user.id, namespace, name);
  }

  // No auth — validated via HMAC signature
  @Post("webhook/:importId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "GitHub webhook receiver" })
  @ApiParam({ name: "importId" })
  @ApiResponse({ status: 204 })
  async handleWebhook(
    @Param("importId") importId: string,
    @Headers("x-hub-signature-256") signature: string | undefined,
    @Req() req: RawBodyRequest<Request>,
  ) {
    await this.importsService.handleWebhook(
      importId,
      signature,
      req.rawBody ?? Buffer.alloc(0),
    );
  }
}
