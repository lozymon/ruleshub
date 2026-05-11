import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

// Shared pagination query DTO. Controllers that take `page` and `limit`
// from the URL should declare a DTO that extends this so the global
// ValidationPipe enforces an integer-and-bounded shape — keeps a stray
// `?limit=1000000` from triggering a multi-million-row Prisma query.
export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
