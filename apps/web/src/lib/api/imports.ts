import { apiClient } from "./client";
import type { GitHubImportCreatedDto, GitHubImportDto } from "@ruleshub/types";

export function createImport(
  repoUrl: string,
  token: string,
): Promise<GitHubImportCreatedDto> {
  return apiClient.post<GitHubImportCreatedDto>(
    "/imports",
    { repoUrl },
    { token },
  );
}

export function listMyImports(token: string): Promise<GitHubImportDto[]> {
  return apiClient.get<GitHubImportDto[]>("/imports/mine", { token });
}

export function deleteImport(
  namespace: string,
  name: string,
  token: string,
): Promise<void> {
  return apiClient.delete<void>(`/imports/${namespace}/${name}`, { token });
}
