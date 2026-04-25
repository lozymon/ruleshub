import { IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateApiKeyDto {
  @ApiProperty({
    description: "Human-readable label for this key",
    example: "GitHub Actions",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}
