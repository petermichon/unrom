import type {
  BootloaderPolicy,
  BrandSummary,
  BrowseDevice,
  DeviceDetail,
  LetterSummary,
  Meta,
  RomDetail,
  RomSummary,
  Summary,
} from "@/lib/types";

// Server-side loaders reach the API directly; in the browser the app is
// same-origin (Caddy proxies /api), so a relative path is used.
function apiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.API_URL ?? "http://127.0.0.1:3000";
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`);
  if (!response.ok) {
    throw new Response(`API request failed: ${path}`, {
      status: response.status,
    });
  }
  return (await response.json()) as T;
}

// The browser keeps the responses it has already seen so a navigation back to
// a page is instant instead of waiting on another round trip. In-flight
// requests are shared too. A new deploy changes the dataset hash, which clears
// the cache; the server never caches across requests.
const CACHE_LIMIT = 40;
const clientCache = new Map<string, Promise<unknown>>();
let contentHash: string | null = null;

/** Called with the root meta hash; a new dataset invalidates every page. */
export function syncContentHash(hash: string): void {
  if (contentHash === null) {
    contentHash = hash;
    return;
  }
  if (contentHash === hash) return;
  contentHash = hash;
  clientCache.clear();
}

/**
 * Cache a browser-side load by key. In-flight promises are shared, and the
 * least recently used entry is evicted past the limit. The server never
 * caches.
 */
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (typeof window === "undefined") return load();

  const hit = clientCache.get(key);
  if (hit) {
    // Refresh insertion order so the limit evicts the least recently used.
    clientCache.delete(key);
    clientCache.set(key, hit);
    return hit as Promise<T>;
  }

  const pending = load().catch((error: unknown) => {
    clientCache.delete(key);
    throw error;
  });
  clientCache.set(key, pending);
  if (clientCache.size > CACHE_LIMIT) {
    const oldest = clientCache.keys().next().value;
    if (oldest !== undefined) clientCache.delete(oldest);
  }
  return pending;
}

async function get<T>(
  path: string,
  { cache = true }: { cache?: boolean } = {},
): Promise<T> {
  return cache ? cached(path, () => fetchJson<T>(path)) : fetchJson<T>(path);
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

/** Vendor-level policy; `null` means no policy has been curated for the vendor. */
export function fetchBootloaderPolicy(
  vendor: string,
): Promise<BootloaderPolicy | null> {
  const path = `/api/bootloader-policies/${encodeURIComponent(vendor)}`;
  return cached(path, async () => {
    const response = await fetch(`${apiBase()}${path}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Response(`API request failed: ${path}`, {
        status: response.status,
      });
    }
    return (await response.json()) as BootloaderPolicy;
  });
}

export async function fetchDevicesPage(options: {
  q?: string;
  letter?: string;
  vendor?: string;
  hasRoms?: boolean;
  sort?: "name" | "coverage" | "roms";
  limit: number;
  offset: number;
}): Promise<{ devices: BrowseDevice[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(options.limit),
    offset: String(options.offset),
  });
  if (options.q) params.set("q", options.q);
  if (options.letter) params.set("letter", options.letter);
  if (options.vendor) params.set("vendor", options.vendor);
  if (options.hasRoms !== undefined) {
    params.set("hasRoms", String(options.hasRoms));
  }
  if (options.sort) params.set("sort", options.sort);
  return cached(`/api/devices?${params}`, async () => {
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
  });
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

/** One row per ROM with its device count, without the device lists. */
export function fetchRomSummaries(): Promise<RomSummary[]> {
  return get<RomSummary[]>("/api/roms/summary");
}

export function fetchRom(id: string): Promise<RomDetail> {
  return get<RomDetail>(`/api/roms/${encodeURIComponent(id)}`);
}

// Meta is the deploy detector, so it bypasses the page cache. A short TTL
// keeps navigation off the network without delaying a new dataset for long.
const META_TTL = 10_000;
let metaCache: { at: number; value: Promise<Meta> } | null = null;

export function fetchMeta(): Promise<Meta> {
  if (typeof window === "undefined") return fetchJson<Meta>("/api/meta");
  const now = Date.now();
  if (metaCache && now - metaCache.at < META_TTL) return metaCache.value;
  const value = fetchJson<Meta>("/api/meta").catch((error: unknown) => {
    if (metaCache?.value === value) metaCache = null;
    throw error;
  });
  metaCache = { at: now, value };
  return value;
}
