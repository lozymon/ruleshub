import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { Request } from 'express';
import { User } from '@prisma/client';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(5000) body!: string;
}

@ApiTags('comments')
@Controller('packages/:namespace/:name/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get comments for a package' })
  @ApiParam({ name: 'namespace' }) @ApiParam({ name: 'name' })
  findAll(@Param('namespace') namespace: string, @Param('name') name: string) {
    return this.commentsService.findByPackage(namespace, name);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a comment on a package' })
  @ApiResponse({ status: 201 })
  @ApiParam({ name: 'namespace' }) @ApiParam({ name: 'name' })
  create(
    @Req() req: Request,
    @Param('namespace') namespace: string,
    @Param('name') name: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create((req.user as User).id, namespace, name, dto.body);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own comment' })
  @ApiParam({ name: 'namespace' }) @ApiParam({ name: 'name' }) @ApiParam({ name: 'commentId' })
  delete(@Req() req: Request, @Param('commentId') commentId: string) {
    return this.commentsService.delete((req.user as User).id, commentId);
  }
}
