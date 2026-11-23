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
 * The install page lists every supported device in a table: a device link, its
 * codename, the version and the release date. A page without the table still
 * parses, with no date.
 */
export function parseCalyxOS(raw: string): NormalizedRomDevice[] {
  const rows: Array<{ codename: string; name: string; date: string | null }> =
    [];

  for (const row of raw.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const html = row[1] ?? "";
    const link = html.match(/href="\.\/devices\/([^"/]+)"[^>]*>([^<]+)<\/a>/);
    if (!link) continue;
    rows.push({
      codename: link[1]!.trim(),
      name: decode(link[2]!),
      date: html.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1] ?? null,
    });
  }

  if (rows.length === 0) {
    for (const match of raw.matchAll(
      /href="\.\/devices\/([^"/]+)"[^>]*>([^<]+)<\/a>/g,
    )) {
      rows.push({
        codename: match[1]!.trim(),
        name: decode(match[2]!),
        date: null,
      });
    }
  }

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.codename || !row.name || seen.has(row.codename)) continue;
    seen.add(row.codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename: row.codename,
        name: row.name,
        brand: brandFor(row.name),
        referenceUrl: `https://calyxos.org/install/devices/${row.codename}/`,
        referenceKind: "derived",
        buildDate: row.date,
      }),
    );
  }

  return records;
}
