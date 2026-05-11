import { IsOptional, IsString, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class ListAdminUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Search by username" })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  q?: string;
}
