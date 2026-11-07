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

// The dataset is immutable for the lifetime of a deployment: it is baked into
// the image and only changes on redeploy. Cache every response so client
// navigations and SSR requests reuse it instead of re-querying the API, and
// dedupe concurrent requests for the same path.
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function get<T>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached !== undefined) return cached as T;

  const pending = inflight.get(path);
  if (pending) return pending as Promise<T>;

  const request = (async () => {
    const response = await fetch(`${apiBase()}${path}`);
    if (!response.ok) {
      throw new Response(`API request failed: ${path}`, {
        status: response.status,
      });
    }
    const data = (await response.json()) as T;
    cache.set(path, data);
    return data;
  })();

  inflight.set(path, request);
  try {
    return (await request) as T;
  } finally {
    inflight.delete(path);
  }
}

export function fetchDevices(vendor?: string): Promise<BrowseDevice[]> {
  const query = vendor ? `?vendor=${encodeURIComponent(vendor)}` : "";
  return get<BrowseDevice[]>(`/api/devices${query}`);
}

/** Seed the browser cache with data already rendered by the server loader. */
export function seedDevices(devices: BrowseDevice[]): void {
  cache.set("/api/devices", devices);
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
  const cached = cache.get("/api/export/sizes");
  if (cached !== undefined) {
    return cached as { json: number | null; sqlite: number | null };
  }

  const [json, sqlite] = await Promise.all([
    headContentLength("/api/export/json"),
    headContentLength("/api/export/sqlite"),
  ]);
  const sizes = { json, sqlite };
  cache.set("/api/export/sizes", sizes);
  return sizes;
}

export function fetchDeviceLetters(): Promise<LetterSummary[]> {
  return get<LetterSummary[]>("/api/devices/letters");
}

export function fetchBrands(): Promise<BrandSummary[]> {
  return get<BrandSummary[]>("/api/brands");
}

/** Seed the browser cache with data already rendered by the server loader. */
export function seedBrands(brands: BrandSummary[]): void {
  cache.set("/api/brands", brands);
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

/** Seed the browser cache with data already rendered by the server loader. */
export function seedRoms(roms: RomDetail[]): void {
  cache.set("/api/roms", roms);
}

export function fetchRom(id: string): Promise<RomDetail> {
  return get<RomDetail>(`/api/roms/${encodeURIComponent(id)}`);
}

export function fetchMeta(): Promise<Meta> {
  return get<Meta>("/api/meta");
}
