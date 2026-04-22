import { Controller, Post, Delete, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { StarsService } from './stars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stars')
@Controller('packages')
export class StarsController {
  constructor(private readonly starsService: StarsService) {}

  @Post(':namespace/:name/star')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Star a package' })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'namespace' }) @ApiParam({ name: 'name' })
  star(@Req() req: Request, @Param('namespace') namespace: string, @Param('name') name: string) {
    return this.starsService.star((req.user as User).id, namespace, name);
  }

  @Delete(':namespace/:name/star')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unstar a package' })
  @ApiResponse({ status: 204 })
  @ApiParam({ name: 'namespace' }) @ApiParam({ name: 'name' })
  unstar(@Req() req: Request, @Param('namespace') namespace: string, @Param('name') name: string) {
    return this.starsService.unstar((req.user as User).id, namespace, name);
  }
}
