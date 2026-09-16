import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "risingos";
const ROM_NAME = "RisingOS";
const SOURCE = "risingos.md";
// Raw data comes from the `fifteen` branch; the file itself has no version.
const ANDROID_BASE = "15";

/**
 * risingos.md groups devices under `## <brand>` headings:
 * `- **Device (codename)** - [maintainer](url)`.
 */
export function parseRisingOS(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();
  let brand: string | null = null;

  for (const line of raw.split("\n")) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      brand = heading[1].trim();
      continue;
    }

    const entry = line.match(/^-\s+\*\*(.+?)\*\*\s*-\s*(.*)$/);
    if (!entry) continue;

    const label = entry[1];
    const extra = entry[2];

    const groups = [...label.matchAll(/\(([^)]+)\)/g)];
    const last = groups.at(-1)?.[1];
    if (!last) continue;

    const name = label.slice(0, label.lastIndexOf("(")).trim() || null;
    const maintainer =
      extra.match(/`([^`]+)`/)?.[1] ?? extra.match(/@[\w.]+/)?.[0] ?? null;
    const sourceUrl = extra.match(/\((https?:\/\/[^)]+)\)/)?.[1] ?? null;

    for (const rawCodename of last.split("/")) {
      const codename = rawCodename.trim();
      if (!codename || seen.has(codename)) continue;
      seen.add(codename);

      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          source: SOURCE,
          codename,
          name,
          brand,
          maintainer,
          sourceUrl,
          androidBase: ANDROID_BASE,
        }),
      );
    }
  }

  return records;
}
