import { Controller, Get, Header, Param, Res } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { BadgesService } from "./badges.service";

@ApiTags("badges")
@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get(":namespace/:name/version")
  @Header("Cache-Control", "public, max-age=300, s-maxage=300")
  @ApiOperation({ summary: "Version badge SVG" })
  @ApiParam({ name: "namespace", example: "acmecorp" })
  @ApiParam({ name: "name", example: "nestjs-rules" })
  @ApiResponse({ status: 200, description: "SVG badge image" })
  async versionBadge(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Res() res: Response,
  ): Promise<void> {
    const svg = await this.badgesService.versionBadge(namespace, name);
    res.set("Content-Type", "image/svg+xml");
    res.send(svg);
  }

  @Get(":namespace/:name/downloads")
  @Header("Cache-Control", "public, max-age=300, s-maxage=300")
  @ApiOperation({ summary: "Downloads badge SVG" })
  @ApiParam({ name: "namespace", example: "acmecorp" })
  @ApiParam({ name: "name", example: "nestjs-rules" })
  @ApiResponse({ status: 200, description: "SVG badge image" })
  async downloadsBadge(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Res() res: Response,
  ): Promise<void> {
    const svg = await this.badgesService.downloadsBadge(namespace, name);
    res.set("Content-Type", "image/svg+xml");
    res.send(svg);
  }
}
