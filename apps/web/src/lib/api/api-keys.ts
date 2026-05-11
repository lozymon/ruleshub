import type { ApiKeyDto, ApiKeyCreatedDto } from "@ruleshub/types";
import { apiClient } from "./client";

export function listApiKeys(): Promise<ApiKeyDto[]> {
  return apiClient.get("/api-keys");
}

export function createApiKey(name: string): Promise<ApiKeyCreatedDto> {
  return apiClient.post("/api-keys", { name });
}

export function revokeApiKey(id: string): Promise<void> {
  return apiClient.delete(`/api-keys/${id}`);
}
