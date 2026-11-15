import { buildRecord, normalizeDate, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "grapheneos";
const ROM_NAME = "GrapheneOS";
const BRAND = "Google";
const REFERENCE = "https://grapheneos.org/faq#supported-devices";

export interface SupportedDevice {
  name: string | null;
  codename: string;
}

function decode(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * The FAQ lists official devices as `<li>Pixel 9 (tokay)</li>` immediately
 * after the "official production support" sentence. Only that first list is
 * current support; later lists cover legacy devices and requirements.
 */
export function parseSupportedDevices(html: string): SupportedDevice[] {
  const list = html.match(
    /official production support for the following devices:<\/p>\s*<ul>(.*?)<\/ul>/s,
  )?.[1];
  if (!list) return [];

  const devices: SupportedDevice[] = [];
  for (const item of list.matchAll(/<li>(.*?)<\/li>/gs)) {
    const label = decode(item[1]);
    const open = label.lastIndexOf("(");
    const close = label.lastIndexOf(")");
    if (open === -1 || close <= open) continue;

    const name = label.slice(0, open).trim() || null;
    const codename = label.slice(open + 1, close).trim();
    if (!codename) continue;
    devices.push({ name, codename });
  }
  return devices;
}

/**
 * The fetcher stores the FAQ page plus each device's newest release, as the
 * release host reports it (`<version> <unix timestamp> <codename> <channel>`).
 * The release carries no security patch level.
 */
export function parseGrapheneOS(raw: string): NormalizedRomDevice[] {
  const data: unknown = JSON.parse(raw);
  if (typeof data !== "object" || data === null) return [];

  const snapshot = data as { page?: unknown; builds?: unknown };
  if (typeof snapshot.page !== "string") return [];

  const builds = new Map<string, string>();
  for (const build of Array.isArray(snapshot.builds) ? snapshot.builds : []) {
    if (!build || typeof build !== "object") continue;
    const entry = build as { codename?: unknown; date?: unknown };
    const codename = str(entry.codename);
    const date = normalizeDate(entry.date);
    if (codename && date) builds.set(codename, date);
  }

  return parseSupportedDevices(snapshot.page).map((device) =>
    buildRecord({
      romId: ROM_ID,
      romName: ROM_NAME,
      codename: device.codename,
      name: device.name,
      brand: BRAND,
      referenceUrl: REFERENCE,
      buildDate: builds.get(device.codename) ?? null,
    }),
  );
}
