import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { Request } from "express";
import { User } from "@prisma/client";
import { PackagesService } from "./packages.service";
import { SearchPackagesDto } from "./dto/search-packages.dto";
import { DiffVersionsQueryDto } from "./dto/diff-versions.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("packages")
@Controller("packages")
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: "List and search packages" })
  @ApiResponse({ status: 200, description: "Paginated package list" })
  search(@Query() query: SearchPackagesDto) {
    return this.packagesService.search(query);
  }

  @Get(":namespace/:name")
  @ApiOperation({ summary: "Get package details and latest version" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiParam({ name: "namespace" })
  @ApiParam({ name: "name" })
  findOne(@Param("namespace") namespace: string, @Param("name") name: string) {
    return this.packagesService.findByFullName(namespace, name);
  }

  @Get(":namespace/:name/diff")
  @ApiOperation({ summary: "Diff two versions of a package" })
  @ApiResponse({ status: 200, description: "Structured manifest diff" })
  @ApiResponse({ status: 404 })
  @ApiParam({ name: "namespace" })
  @ApiParam({ name: "name" })
  diff(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Query() query: DiffVersionsQueryDto,
  ) {
    return this.packagesService.diffVersions(
      namespace,
      name,
      query.from,
      query.to,
    );
  }

  @Get(":namespace/:name/:version")
  @ApiOperation({ summary: "Get a specific package version" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findVersion(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Param("version") version: string,
  ) {
    return this.packagesService.findVersion(namespace, name, version);
  }

  @Get(":namespace/:name/:version/preview")
  @ApiOperation({ summary: "Get file contents preview for all tool targets" })
  @ApiResponse({ status: 200, description: "File previews per tool" })
  @ApiResponse({ status: 404 })
  @ApiParam({ name: "namespace" })
  @ApiParam({ name: "name" })
  @ApiParam({ name: "version" })
  preview(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Param("version") version: string,
  ) {
    return this.packagesService.getFilePreview(namespace, name, version);
  }

  @Get(":namespace/:name/:version/download")
  @ApiOperation({ summary: "Get a download URL for a package version" })
  @ApiResponse({
    status: 200,
    description: "JSON envelope { url } pointing at the streaming endpoint",
  })
  @ApiResponse({ status: 404 })
  download(
    @Req() req: Request,
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Param("version") version: string,
  ) {
    // Build the base from the request itself so the URL we return is
    // reachable by whoever just called us. `trust proxy` is set in
    // main.ts so req.protocol and req.get('host') reflect the
    // public-facing values behind any reverse proxy. /v1 mirrors the
    // global prefix in main.ts.
    const base = `${req.protocol}://${req.get("host")}/v1`;
    return this.packagesService.getDownloadUrl(namespace, name, version, base);
  }

  @Get(":namespace/:name/:version/file")
  @ApiOperation({ summary: "Stream the package zip artifact" })
  @ApiResponse({ status: 200, description: "application/zip stream" })
  @ApiResponse({ status: 404 })
  async file(
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Param("version") version: string,
    @Res() res: Response,
  ) {
    const { stream, filename } = await this.packagesService.streamFile(
      namespace,
      name,
      version,
    );
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    stream.pipe(res);
    stream.on("error", (err) => {
      res.destroy(err);
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        manifest: {
          type: "string",
          description: "JSON-encoded ruleshub manifest",
        },
      },
    },
  })
  @ApiOperation({ summary: "Publish a new package or version" })
  @ApiResponse({ status: 201, description: "Version published" })
  @ApiResponse({ status: 400, description: "Invalid manifest or zip" })
  @ApiResponse({ status: 409, description: "Version already exists" })
  async publish(
    @Req() req: Request,
    @UploadedFile() file: { buffer: Buffer },
    @Body("manifest") manifestJson: string,
  ) {
    if (!file) throw new BadRequestException("No file uploaded");
    if (!manifestJson) throw new BadRequestException("No manifest provided");
    let manifest: unknown;
    try {
      manifest = JSON.parse(manifestJson);
    } catch {
      throw new BadRequestException("Invalid manifest JSON");
    }
    const user = req.user as User;
    return this.packagesService.publish(user.id, file.buffer, manifest);
  }

  @Post(":namespace/:name/fork")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Fork a package into own namespace" })
  @ApiResponse({ status: 201 })
  @ApiParam({ name: "namespace" })
  @ApiParam({ name: "name" })
  fork(
    @Req() req: Request,
    @Param("namespace") namespace: string,
    @Param("name") name: string,
  ) {
    return this.packagesService.fork((req.user as User).id, namespace, name);
  }

  @Delete(":namespace/:name/:version")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Yank a package version" })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async yank(
    @Req() req: Request,
    @Param("namespace") namespace: string,
    @Param("name") name: string,
    @Param("version") version: string,
  ) {
    const user = req.user as User;
    await this.packagesService.yank(user.id, namespace, name, version);
  }
}
