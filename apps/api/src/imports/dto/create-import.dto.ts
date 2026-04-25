import { IsUrl } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateImportDto {
  @ApiProperty({ example: "https://github.com/acmecorp/nestjs-rules" })
  @IsUrl({ protocols: ["https"], host_whitelist: ["github.com"] })
  repoUrl: string;
}
