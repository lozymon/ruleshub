import { IsUrl, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWebhookDto {
  @ApiProperty({
    description: "HTTPS URL to POST events to",
    example: "https://example.com/hooks/ruleshub",
  })
  @IsUrl({ protocols: ["https"], require_tld: true })
  url: string;

  @ApiProperty({
    description: "Full package name to subscribe to (namespace/name)",
    example: "lozymon/nestjs-rules",
  })
  @IsString()
  packageFullName: string;
}
