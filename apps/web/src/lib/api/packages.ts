import {
  PackageDto,
  PackageSearchParams,
  PaginatedResponse,
  VersionDiffDto,
  PackageVersionPreviewDto,
} from "@ruleshub/types";
import { apiClient } from "./client";

export function searchPackages(
  params: PackageSearchParams = {},
): Promise<PaginatedResponse<PackageDto>> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const qs = query.toString();
  return apiClient.get(`/packages${qs ? `?${qs}` : ""}`);
}

export function getPackage(
  namespace: string,
  name: string,
): Promise<PackageDto> {
  return apiClient.get(`/packages/${namespace}/${name}`);
}

export function getPackageVersion(
  namespace: string,
  name: string,
  version: string,
): Promise<PackageDto> {
  return apiClient.get(`/packages/${namespace}/${name}/${version}`);
}

export function getDownloadUrl(
  namespace: string,
  name: string,
  version: string,
): Promise<{ url: string }> {
  return apiClient.get(`/packages/${namespace}/${name}/${version}/download`);
}

export function yankVersion(
  namespace: string,
  name: string,
  version: string,
): Promise<void> {
  return apiClient.delete(`/packages/${namespace}/${name}/${version}`);
}

export function getPackageDiff(
  namespace: string,
  name: string,
  from: string,
  to: string,
): Promise<VersionDiffDto> {
  return apiClient.get(
    `/packages/${namespace}/${name}/diff?from=${from}&to=${to}`,
  );
}

export function getPackagePreview(
  namespace: string,
  name: string,
  version: string,
): Promise<PackageVersionPreviewDto> {
  return apiClient.get(`/packages/${namespace}/${name}/${version}/preview`);
}

export async function publishPackage(
  file: File,
  manifest: Record<string, unknown>,
): Promise<unknown> {
  const { config } = await import("../config");
  const form = new FormData();
  form.append("file", file);
  form.append("manifest", JSON.stringify(manifest));
  const r = await fetch(`${config.apiUrl}/packages`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({ message: r.statusText }));
    return Promise.reject(
      new Error((body as { message?: string }).message ?? r.statusText),
    );
  }
  return r.json();
}
