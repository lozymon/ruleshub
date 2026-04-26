import { IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

const SEMVER_RE = /^\d+\.\d+\.\d+/;

export class DiffVersionsQueryDto {
  @ApiProperty({ description: "From version (e.g. 1.0.0)", example: "1.0.0" })
  @IsString()
  @Matches(SEMVER_RE, { message: "from must be a valid semver" })
  from: string;

  @ApiProperty({ description: "To version (e.g. 1.1.0)", example: "1.1.0" })
  @IsString()
  @Matches(SEMVER_RE, { message: "to must be a valid semver" })
  to: string;
}
