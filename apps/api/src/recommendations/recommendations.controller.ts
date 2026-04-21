import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { RecommendationsService } from './recommendations.service';

class RecommendationsQueryDto {
  @IsOptional() @IsString() projectType?: string;
  @IsOptional() @IsString() tool?: string;
}

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get package recommendations by project type and tool' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'projectType', required: false })
  @ApiQuery({ name: 'tool', required: false })
  getRecommendations(@Query() query: RecommendationsQueryDto) {
    return this.recommendationsService.getRecommendations(query.projectType, query.tool);
  }
}
