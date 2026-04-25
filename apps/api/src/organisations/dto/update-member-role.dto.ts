import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OrgRole } from "@prisma/client";

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ["admin", "member"] })
  @IsEnum(["admin", "member"] as const)
  role!: Exclude<OrgRole, "owner">;
}
