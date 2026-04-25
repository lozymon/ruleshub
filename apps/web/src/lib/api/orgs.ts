import type {
  OrgDto,
  OrgMemberDto,
  PackageDto,
  PaginatedResponse,
} from "@ruleshub/types";
import { apiClient } from "./client";

export function getMyOrgs(
  token: string,
): Promise<(OrgDto & { role: "owner" | "admin" | "member" })[]> {
  return apiClient.get("/orgs/mine", { token });
}

export function getOrg(slug: string): Promise<OrgDto> {
  return apiClient.get(`/orgs/${slug}`);
}

export function createOrg(
  data: { slug: string; displayName: string },
  token: string,
): Promise<OrgDto> {
  return apiClient.post("/orgs", data, { token });
}

export function updateOrg(
  slug: string,
  data: { displayName?: string; avatarUrl?: string },
  token: string,
): Promise<OrgDto> {
  return apiClient.patch(`/orgs/${slug}`, data, { token });
}

export function deleteOrg(slug: string, token: string): Promise<void> {
  return apiClient.delete(`/orgs/${slug}`, { token });
}

export function getOrgMembers(slug: string): Promise<OrgMemberDto[]> {
  return apiClient.get(`/orgs/${slug}/members`);
}

export function addOrgMember(
  slug: string,
  username: string,
  token: string,
): Promise<void> {
  return apiClient.post(`/orgs/${slug}/members`, { username }, { token });
}

export function updateOrgMemberRole(
  slug: string,
  username: string,
  role: "admin" | "member",
  token: string,
): Promise<void> {
  return apiClient.patch(
    `/orgs/${slug}/members/${username}`,
    { role },
    { token },
  );
}

export function removeOrgMember(
  slug: string,
  username: string,
  token: string,
): Promise<void> {
  return apiClient.delete(`/orgs/${slug}/members/${username}`, { token });
}

export function leaveOrg(slug: string, token: string): Promise<void> {
  return apiClient.delete(`/orgs/${slug}/members/me`, { token });
}

export function getOrgPackages(
  slug: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<PackageDto>> {
  return apiClient.get(`/orgs/${slug}/packages?page=${page}&limit=${limit}`);
}
