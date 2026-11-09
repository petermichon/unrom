import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "calyxos";
const ROM_NAME = "CalyxOS";

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function brandFor(name: string): string | null {
  if (/^Pixel\b/.test(name)) return "Google";
  if (/Fairphone/i.test(name)) return "Fairphone";
  if (/^moto\b/i.test(name)) return "Motorola";
  if (/^SHIFT/i.test(name)) return "SHIFT";
  return null;
}

/**
 * The install page links every supported device as
 * `<a href="./devices/<codename>">Device name</a>`.
 */
export function parseCalyxOS(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const match of raw.matchAll(
    /href="\.\/devices\/([^"/]+)"[^>]*>([^<]+)<\/a>/g,
  )) {
    const codename = match[1].trim();
    const name = decode(match[2]);
    if (!codename || !name || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name,
        brand: brandFor(name),
        referenceUrl: `https://calyxos.org/install/devices/${codename}/`,
        referenceKind: "derived",
      }),
    );
  }

  return records;
}
