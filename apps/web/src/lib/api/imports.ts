import { apiClient } from "./client";
import type { GitHubImportCreatedDto, GitHubImportDto } from "@ruleshub/types";

export function createImport(repoUrl: string): Promise<GitHubImportCreatedDto> {
  return apiClient.post<GitHubImportCreatedDto>("/imports", { repoUrl });
}

export function listMyImports(): Promise<GitHubImportDto[]> {
  return apiClient.get<GitHubImportDto[]>("/imports/mine");
}

export function deleteImport(namespace: string, name: string): Promise<void> {
  return apiClient.delete<void>(`/imports/${namespace}/${name}`);
}
