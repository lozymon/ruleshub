const DEFAULT_API_URL = "https://api.ruleshub.dev/v1";

function getApiUrl(): string {
  return process.env.RULESHUB_API_URL ?? DEFAULT_API_URL;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((rest.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${getApiUrl()}${path}`, { ...rest, headers });

  if (!res.ok) {
    const body = (await res
      .json()
      .catch(() => ({ message: res.statusText }))) as { message?: string };
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface ApiPackageVersion {
  id: string;
  version: string;
  manifestJson: unknown;
  storageKey: string;
  yanked: boolean;
}

export interface ApiPackage {
  id: string;
  namespace: string;
  name: string;
  type: string;
  latestVersion: ApiPackageVersion | null;
}

export const apiClient = {
  getPackage: (namespace: string, name: string) =>
    request<ApiPackage>(`/packages/${namespace}/${name}`),

  getPackageVersion: (namespace: string, name: string, version: string) =>
    request<ApiPackageVersion>(`/packages/${namespace}/${name}/${version}`),

  getDownloadUrl: (namespace: string, name: string, version: string) =>
    request<{ url: string }>(
      `/packages/${namespace}/${name}/${version}/download`,
    ),

  publishPackage: async (
    fileBuffer: Buffer,
    manifest: Record<string, unknown>,
    token: string,
  ) => {
    const { Blob } = await import("node:buffer");
    const form = new FormData();
    form.append(
      "file",
      new Blob([fileBuffer], { type: "application/zip" }),
      "package.zip",
    );
    form.append("manifest", JSON.stringify(manifest));

    const res = await fetch(`${getApiUrl()}/packages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const body = (await res
        .json()
        .catch(() => ({ message: res.statusText }))) as { message?: string };
      throw new Error(body.message ?? `Publish failed: ${res.status}`);
    }
    return res.json();
  },
};
