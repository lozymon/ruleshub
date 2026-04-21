import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetType, SupportedTool } from '@ruleshub/types';

export class SearchPackagesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() q?: string;
  @ApiPropertyOptional({ enum: ['rule','command','workflow','agent','mcp-server','pack'] })
  @IsOptional() @IsEnum(['rule','command','workflow','agent','mcp-server','pack']) type?: AssetType;
  @ApiPropertyOptional() @IsOptional() @IsString() tag?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() projectType?: string;
  @ApiPropertyOptional({ enum: ['claude-code','cursor','copilot','windsurf','cline','aider','continue'] })
  @IsOptional() @IsEnum(['claude-code','cursor','copilot','windsurf','cline','aider','continue']) tool?: SupportedTool;
  @ApiPropertyOptional({ enum: ['individual', 'pack'] })
  @IsOptional() @IsEnum(['individual', 'pack']) scope?: 'individual' | 'pack';
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
}
