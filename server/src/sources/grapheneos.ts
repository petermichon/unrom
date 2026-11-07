import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "grapheneos";
const ROM_NAME = "GrapheneOS";
const BRAND = "Google";
const REFERENCE = "https://grapheneos.org/faq#supported-devices";

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
export function parseGrapheneOS(raw: string): NormalizedRomDevice[] {
  const list = raw.match(
    /official production support for the following devices:<\/p>\s*<ul>(.*?)<\/ul>/s,
  )?.[1];
  if (!list) return [];

  const records: NormalizedRomDevice[] = [];
  for (const item of list.matchAll(/<li>(.*?)<\/li>/gs)) {
    const label = decode(item[1]);
    const open = label.lastIndexOf("(");
    const close = label.lastIndexOf(")");
    if (open === -1 || close <= open) continue;

    const name = label.slice(0, open).trim() || null;
    const codename = label.slice(open + 1, close).trim();
    if (!codename) continue;

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name,
        brand: BRAND,
        referenceUrl: REFERENCE,
      }),
    );
  }
  return records;
}
