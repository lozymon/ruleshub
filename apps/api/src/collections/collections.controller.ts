import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { Request } from 'express';
import { User } from '@prisma/client';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateCollectionDto {
  @IsString() @Matches(/^[a-z0-9-]+$/) slug!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isPublic?: boolean;
}

class CollectionItemDto {
  @IsString() packageName!: string;
}

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all public collections' })
  @ApiResponse({ status: 200 })
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':username/:slug')
  @ApiOperation({ summary: 'Get a collection with its packages' })
  @ApiParam({ name: 'username' }) @ApiParam({ name: 'slug' })
  findOne(@Param('username') username: string, @Param('slug') slug: string) {
    return this.collectionsService.findOne(username, slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a collection' })
  @ApiResponse({ status: 201 })
  create(@Req() req: Request, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create((req.user as User).id, dto);
  }

  @Post(':username/:slug/items')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a package to a collection' })
  @ApiParam({ name: 'username' }) @ApiParam({ name: 'slug' })
  addItem(
    @Req() req: Request,
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Body() dto: CollectionItemDto,
  ) {
    return this.collectionsService.addItem((req.user as User).id, username, slug, dto.packageName);
  }

  @Delete(':username/:slug/items/:packageName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a package from a collection' })
  @ApiParam({ name: 'username' }) @ApiParam({ name: 'slug' }) @ApiParam({ name: 'packageName' })
  removeItem(
    @Req() req: Request,
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Param('packageName') packageName: string,
  ) {
    return this.collectionsService.removeItem((req.user as User).id, username, slug, packageName);
  }
}
