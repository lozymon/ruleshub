import { IsString, Matches, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrganisationDto {
  @ApiProperty({
    description: "URL-safe slug (3–39 chars, lowercase alphanumeric + hyphens)",
  })
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,37}[a-z0-9]$/)
  @MinLength(3)
  @MaxLength(39)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName!: string;
}
