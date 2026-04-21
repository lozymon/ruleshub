import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { PackagesService } from './packages.service';
import { SearchPackagesDto } from './dto/search-packages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List and search packages' })
  @ApiResponse({ status: 200, description: 'Paginated package list' })
  search(@Query() query: SearchPackagesDto) {
    return this.packagesService.search(query);
  }

  @Get(':namespace/:name')
  @ApiOperation({ summary: 'Get package details and latest version' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @ApiParam({ name: 'namespace' })
  @ApiParam({ name: 'name' })
  findOne(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.packagesService.findByFullName(namespace, name);
  }

  @Get(':namespace/:name/:version')
  @ApiOperation({ summary: 'Get a specific package version' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  findVersion(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Param('version') version: string,
  ) {
    return this.packagesService.findVersion(namespace, name, version);
  }

  @Get(':namespace/:name/:version/download')
  @ApiOperation({ summary: 'Get a signed download URL for a package version' })
  @ApiResponse({ status: 200, description: 'Signed download URL' })
  @ApiResponse({ status: 404 })
  download(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Param('version') version: string,
  ) {
    return this.packagesService.getDownloadUrl(namespace, name, version);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Publish a new package or version' })
  @ApiResponse({ status: 201, description: 'Version published' })
  @ApiResponse({ status: 400, description: 'Invalid manifest or zip' })
  @ApiResponse({ status: 409, description: 'Version already exists' })
  async publish(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const user = req.user as User;
    return this.packagesService.publish(user.id, file.buffer);
  }

  @Delete(':namespace/:name/:version')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Yank a package version' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 403 })
  @ApiResponse({ status: 404 })
  async yank(
    @Req() req: Request,
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Param('version') version: string,
  ) {
    const user = req.user as User;
    await this.packagesService.yank(user.id, namespace, name, version);
  }
}
