import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "cipheros";
const ROM_NAME = "CipherOS";

interface ListItem {
  "@type"?: unknown;
  name?: unknown;
  url?: unknown;
}

interface ItemList {
  "@type"?: unknown;
  itemListElement?: unknown;
}

function itemList(block: unknown): ListItem[] | null {
  const candidates = Array.isArray(block) ? block : [block];
  for (const candidate of candidates) {
    if (typeof candidate !== "object" || candidate === null) continue;
    const list = candidate as ItemList;
    if (list["@type"] !== "ItemList") continue;
    if (!Array.isArray(list.itemListElement)) continue;
    return list.itemListElement as ListItem[];
  }
  return null;
}

/**
 * The devices page carries its roster as schema.org `ItemList` markup for
 * crawlers: one entry per device with its name and page URL. The page URL ends
 * in the codename, which the display name repeats in parentheses.
 */
export function parseCipheros(raw: string): NormalizedRomDevice[] {
  const scripts = raw.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  );

  for (const script of scripts) {
    let data: unknown;
    try {
      data = JSON.parse(script[1]!);
    } catch {
      continue;
    }

    const items = itemList(data);
    if (!items) continue;

    const records: NormalizedRomDevice[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      if (typeof item.name !== "string" || typeof item.url !== "string")
        continue;

      let codename: string;
      try {
        const url = new URL(item.url);
        codename = decodeURIComponent(
          url.pathname.split("/").filter(Boolean).at(-1) ?? "",
        );
      } catch {
        continue;
      }
      if (!codename || seen.has(codename)) continue;
      seen.add(codename);

      const suffix = ` (${codename})`;
      const name = item.name.endsWith(suffix)
        ? item.name.slice(0, -suffix.length)
        : item.name;

      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          codename,
          name,
          referenceUrl: item.url,
        }),
      );
    }

    return records;
  }

  return [];
}
