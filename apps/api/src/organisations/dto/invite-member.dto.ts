import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class InviteMemberDto {
  @ApiProperty({ description: "GitHub username of the user to invite" })
  @IsString()
  username!: string;
}
