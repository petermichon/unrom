import type {
  BrowseDevice,
  DeviceDetail,
  Mapping,
  Meta,
  RomDetail,
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

export function fetchDevices(): Promise<BrowseDevice[]> {
  return get<BrowseDevice[]>("/api/devices");
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

export function fetchMappings(): Promise<Mapping[]> {
  return get<Mapping[]>("/api/data");
}

export function fetchMeta(): Promise<Meta> {
  return get<Meta>("/api/meta");
}
