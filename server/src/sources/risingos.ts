import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "risingos";
const ROM_NAME = "RisingOS";

// The device list carries only maintainer contacts (Telegram/GitHub profiles),
// which are not citations. Cite the pinned roster file the records came from.
const REFERENCE =
  "https://github.com/RisingOS-Revived/official_devices/blob/fifteen/devices.md";

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

    const groups = [...label.matchAll(/\(([^)]+)\)/g)];
    const last = groups.at(-1)?.[1];
    if (!last) continue;

    const name = label.slice(0, label.lastIndexOf("(")).trim() || null;
    const parts = last
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);
    const primary = parts[0];

    for (const codename of parts) {
      if (seen.has(codename)) continue;
      seen.add(codename);

      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          codename,
          name,
          brand,
          referenceUrl: REFERENCE,
          reportedCodename: primary,
        }),
      );
    }
  }

  return records;
}
