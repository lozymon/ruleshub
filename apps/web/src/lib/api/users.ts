import { UserDto } from "@ruleshub/types";
import { apiClient } from "./client";

export function getUser(username: string): Promise<UserDto> {
  return apiClient.get(`/users/${username}`);
}
