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
  isAdmin: boolean;
  createdAt: string;
}

export interface PackageVersionDto {
  id: string;
  version: string;
  changelog: string | null;
  downloads: number;
  yanked: boolean;
  publishedAt: string;
}

export interface PackageSummaryDto {
  fullName: string;
  namespace: string;
  name: string;
  type: AssetType;
  description: string;
  versionRange: string;
  latestVersion: string | null;
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
  versions: PackageVersionDto[];
  includes: PackageSummaryDto[];
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

export interface GitHubImportDto {
  id: string;
  repoUrl: string;
  packageFullName: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface GitHubImportCreatedDto extends GitHubImportDto {
  webhookSecret: string;
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

export type WebhookEvent =
  | "package.version.published"
  | "package.version.yanked"
  | "package.dependency.yanked";

export interface WebhookDto {
  id: string;
  url: string;
  packageFullName: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookCreatedDto extends WebhookDto {
  secret: string;
}

export interface WebhookDeliveryDto {
  id: string;
  event: WebhookEvent;
  statusCode: number | null;
  success: boolean;
  attemptedAt: string;
}

export type DiffChangeKind = "unchanged" | "changed" | "added" | "removed";

export interface DiffChange {
  field: string;
  kind: DiffChangeKind;
  fromValue: unknown;
  toValue: unknown;
}

export interface VersionDiffDto {
  from: string;
  to: string;
  changes: DiffChange[];
}

export interface PackageFilePreviewDto {
  tool: string | null;
  path: string;
  content: string;
  isTarget: boolean;
}

export interface PackageVersionPreviewDto {
  version: string;
  previews: PackageFilePreviewDto[];
}
