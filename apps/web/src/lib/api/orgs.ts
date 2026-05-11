import type {
  OrgDto,
  OrgMemberDto,
  PackageDto,
  PaginatedResponse,
} from "@ruleshub/types";
import { apiClient } from "./client";

export function getMyOrgs(): Promise<
  (OrgDto & { role: "owner" | "admin" | "member" })[]
> {
  return apiClient.get("/orgs/mine");
}

export function getOrg(slug: string): Promise<OrgDto> {
  return apiClient.get(`/orgs/${slug}`);
}

export function createOrg(data: {
  slug: string;
  displayName: string;
}): Promise<OrgDto> {
  return apiClient.post("/orgs", data);
}

export function updateOrg(
  slug: string,
  data: { displayName?: string; avatarUrl?: string },
): Promise<OrgDto> {
  return apiClient.patch(`/orgs/${slug}`, data);
}

export function deleteOrg(slug: string): Promise<void> {
  return apiClient.delete(`/orgs/${slug}`);
}

export function getOrgMembers(slug: string): Promise<OrgMemberDto[]> {
  return apiClient.get(`/orgs/${slug}/members`);
}

export function addOrgMember(slug: string, username: string): Promise<void> {
  return apiClient.post(`/orgs/${slug}/members`, { username });
}

export function updateOrgMemberRole(
  slug: string,
  username: string,
  role: "admin" | "member",
): Promise<void> {
  return apiClient.patch(`/orgs/${slug}/members/${username}`, { role });
}

export function removeOrgMember(slug: string, username: string): Promise<void> {
  return apiClient.delete(`/orgs/${slug}/members/${username}`);
}

export function leaveOrg(slug: string): Promise<void> {
  return apiClient.delete(`/orgs/${slug}/members/me`);
}

export function getOrgPackages(
  slug: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<PackageDto>> {
  return apiClient.get(`/orgs/${slug}/packages?page=${page}&limit=${limit}`);
}
