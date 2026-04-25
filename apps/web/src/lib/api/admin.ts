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
  token: string,
): Promise<AdminUsersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (q) params.set("q", q);
  return apiClient.get(`/admin/users?${params}`, { token });
}

export function setUserVerified(
  username: string,
  verified: boolean,
  token: string,
): Promise<void> {
  return apiClient.patch(
    `/admin/users/${username}/verify`,
    { verified },
    { token },
  );
}

export function setUserBlocked(
  username: string,
  blocked: boolean,
  token: string,
): Promise<void> {
  return apiClient.patch(
    `/admin/users/${username}/block`,
    { blocked },
    { token },
  );
}
