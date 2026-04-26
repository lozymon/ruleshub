import {
  Controller,
  Get,
  Post,
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
import { WebhooksService } from "./webhooks.service";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("webhooks")
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Subscribe to package events via webhook" })
  @ApiResponse({
    status: 201,
    description: "Webhook created — secret shown once only",
  })
  @ApiResponse({ status: 404, description: "Package not found" })
  @ApiResponse({ status: 409, description: "Duplicate webhook" })
  create(@Req() req: Request, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.create((req.user as User).id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List webhooks for the authenticated user" })
  @ApiResponse({ status: 200, description: "Paginated webhook list" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  list(
    @Req() req: Request,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.webhooksService.list(
      (req.user as User).id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a webhook subscription" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  @ApiParam({ name: "id" })
  remove(@Req() req: Request, @Param("id") id: string) {
    return this.webhooksService.remove((req.user as User).id, id);
  }

  @Get(":id/deliveries")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List recent deliveries for a webhook" })
  @ApiResponse({ status: 200, description: "Paginated delivery log" })
  @ApiParam({ name: "id" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  listDeliveries(
    @Req() req: Request,
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.webhooksService.listDeliveries(
      (req.user as User).id,
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post(":id/ping")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Send a test ping to verify the webhook URL" })
  @ApiResponse({ status: 201, description: "Ping dispatched" })
  @ApiParam({ name: "id" })
  ping(@Req() req: Request, @Param("id") id: string) {
    return this.webhooksService.ping((req.user as User).id, id);
  }
}
