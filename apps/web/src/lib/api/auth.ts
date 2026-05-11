import { UserDto } from "@ruleshub/types";
import { apiClient } from "./client";

export function getMe(): Promise<UserDto> {
  return apiClient.get<UserDto>("/auth/me");
}

export function logout(): Promise<void> {
  return apiClient.post<void>("/auth/logout", undefined);
}
