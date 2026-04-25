import { AssetType } from "./manifest";
import { SupportedTool } from "./tools";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  verified: boolean;
  createdAt: string;
}

export interface PackageVersionDto {
  id: string;
  version: string;
  downloads: number;
  yanked: boolean;
  publishedAt: string;
}

export interface PackageDto {
  id: string;
  namespace: string;
  name: string;
  fullName: string;
  type: AssetType;
  description: string;
  tags: string[];
  projectTypes: string[];
  supportedTools: SupportedTool[];
  totalDownloads: number;
  stars: number;
  qualityScore: number;
  isPrivate: boolean;
  owner: UserDto;
  latestVersion: PackageVersionDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgDto {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
  memberCount: number;
  createdAt: string;
}

export interface OrgMemberDto {
  user: UserDto;
  role: "owner" | "admin" | "member";
}

export interface ApiKeyDto {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreatedDto extends ApiKeyDto {
  key: string;
}

export interface PackageSearchParams {
  q?: string;
  namespace?: string;
  type?: AssetType;
  tag?: string;
  projectType?: string;
  tool?: SupportedTool;
  scope?: "individual" | "pack";
  sort?: "trending" | "newest" | "mostDownloaded" | "mostStarred";
  page?: number;
  limit?: number;
}
