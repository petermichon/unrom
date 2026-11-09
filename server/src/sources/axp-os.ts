import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "axp-os";
const ROM_NAME = "AXP.OS";

/**
 * The project sitemap lists one page per supported device as
 * `/devices/<vendor>/<codename>/`. The changelog pages share the prefix but
 * are not devices.
 */
export function parseAxpOs(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const match of raw.matchAll(
    /<loc>https:\/\/axpos\.org\/devices\/([^/]+)\/([^/]+)\/<\/loc>/g,
  )) {
    const brand = match[1];
    const codename = match[2];
    if (brand === "changelogs") continue;
    if (seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        brand,
        referenceUrl: `https://axpos.org/devices/${brand}/${codename}/`,
        referenceKind: "derived",
      }),
    );
  }

  return records;
}
