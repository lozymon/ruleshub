import { apiClient } from "./client";

export interface AdminUserDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  verified: boolean;
  blocked: boolean;
  packageCount: number;
  createdAt: string;
}

export interface AdminUsersResponse {
  data: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
}

export function listAdminUsers(
  page: number,
  limit: number,
  q: string | undefined,
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) params.set("q", q);
  return apiClient.get(`/admin/users?${params}`);
}

export function setUserVerified(
  username: string,
  verified: boolean,
): Promise<void> {
  return apiClient.patch(`/admin/users/${username}/verify`, { verified });
}

export function setUserBlocked(
  username: string,
  blocked: boolean,
): Promise<void> {
  return apiClient.patch(`/admin/users/${username}/block`, { blocked });
}
