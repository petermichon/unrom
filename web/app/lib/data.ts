import type {
  BrandSummary,
  BrowseDevice,
  DeviceDetail,
  LetterSummary,
  Meta,
  RomDetail,
  Summary,
} from "@/lib/types";

// Server-side loaders reach the API directly; in the browser the app is
// same-origin (Caddy proxies /api), so a relative path is used.
function apiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.API_URL ?? "http://127.0.0.1:3000";
}

// Every loader queries the API directly. The dataset can be replaced under a
// running frontend (a deploy may recreate the API without this process), so no
// response is cached across requests: a stale copy cannot outlive a deploy.
async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`);
  if (!response.ok) {
    throw new Response(`API request failed: ${path}`, {
      status: response.status,
    });
  }
  return (await response.json()) as T;
}

export function fetchAllDevices(): Promise<BrowseDevice[]> {
  return get<BrowseDevice[]>("/api/devices?all=true");
}

export function fetchSummary(): Promise<Summary> {
  return get<Summary>("/api/summary");
}

/** The API's own index, used by the data page to list endpoints. */
export interface ApiIndex {
  name: string;
  endpoints: string[];
}

export function fetchApiIndex(): Promise<ApiIndex> {
  return get<ApiIndex>("/api");
}

async function headContentLength(path: string): Promise<number | null> {
  try {
    const response = await fetch(`${apiBase()}${path}`, { method: "HEAD" });
    if (!response.ok) return null;
    const value = response.headers.get("content-length");
    return value ? Number(value) : null;
  } catch {
    return null;
  }
}

/**
 * Export sizes are not in any JSON response, so ask the API with HEAD. A
 * failure is non-fatal: the data page still links to the downloads.
 */
export async function fetchExportSizes(): Promise<{
  json: number | null;
  sqlite: number | null;
}> {
  const [json, sqlite] = await Promise.all([
    headContentLength("/api/export/json"),
    headContentLength("/api/export/sqlite"),
  ]);
  return { json, sqlite };
}

export function fetchDeviceLetters(): Promise<LetterSummary[]> {
  return get<LetterSummary[]>("/api/devices/letters");
}

export function fetchBrands(): Promise<BrandSummary[]> {
  return get<BrandSummary[]>("/api/brands");
}

export async function fetchDevicesPage(options: {
  letter?: string;
  vendor?: string;
  limit: number;
  offset: number;
}): Promise<{ devices: BrowseDevice[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(options.limit),
    offset: String(options.offset),
  });
  if (options.letter) params.set("letter", options.letter);
  if (options.vendor) params.set("vendor", options.vendor);
  const response = await fetch(`${apiBase()}/api/devices?${params}`);
  if (!response.ok) {
    throw new Response("API request failed: /api/devices", {
      status: response.status,
    });
  }
  return {
    devices: (await response.json()) as BrowseDevice[],
    total: Number(response.headers.get("x-total-count") ?? 0),
  };
}

export function fetchDevice(
  vendor: string,
  codename: string,
): Promise<DeviceDetail> {
  return get<DeviceDetail>(
    `/api/devices/${encodeURIComponent(vendor)}/${encodeURIComponent(codename)}`,
  );
}

export function fetchRoms(): Promise<RomDetail[]> {
  return get<RomDetail[]>("/api/roms");
}

export function fetchRom(id: string): Promise<RomDetail> {
  return get<RomDetail>(`/api/roms/${encodeURIComponent(id)}`);
}

export function fetchMeta(): Promise<Meta> {
  return get<Meta>("/api/meta");
}
