import type { ApiKeyDto, ApiKeyCreatedDto } from "@ruleshub/types";
import { apiClient } from "./client";

export function listApiKeys(token: string): Promise<ApiKeyDto[]> {
  return apiClient.get("/api-keys", { token });
}

export function createApiKey(
  name: string,
  token: string,
): Promise<ApiKeyCreatedDto> {
  return apiClient.post("/api-keys", { name }, { token });
}

export function revokeApiKey(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api-keys/${id}`, { token });
}
