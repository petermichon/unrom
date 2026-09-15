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

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`);
  if (!response.ok) {
    throw new Response(`API request failed: ${path}`, {
      status: response.status,
    });
  }
  return (await response.json()) as T;
}

export function fetchDevices(): Promise<BrowseDevice[]> {
  return get<BrowseDevice[]>("/api/devices");
}

export function fetchDevice(codename: string): Promise<DeviceDetail> {
  return get<DeviceDetail>(`/api/devices/${encodeURIComponent(codename)}`);
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
