import { DEVICE_NAMES } from "../data/registry.ts";
import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "axp-os";
const ROM_NAME = "AXP.OS";

// The rendered device page is generated from this file in the project's site
// mirror. The page itself went away with the domain, but the mirror is a
// repository the project still owns and the file is per device.
const SITE_ROOT =
  "https://github.com/AXP-OS/axpos-org/blob/hugo/content/devices";

// Brand section names in the mirror. GitHub paths are case-sensitive.
const BRAND_DIRS: Record<string, string> = {
  fairphone: "Fairphone",
  google: "Google",
  lg: "LG",
  oneplus: "OnePlus",
  samsung: "Samsung",
  sony: "Sony",
};

// File names use the curated codename spelling (`FP3`, `h815`), not the
// lowercase form the sitemap lists. The curated registry owns spelling.
const CASINGS = new Map<string, string>();
for (const key of Object.keys(DEVICE_NAMES)) {
  const [vendor, codename] = key.split("\0");
  CASINGS.set(`${vendor}\0${codename.toLowerCase()}`, codename);
}

function referenceFor(brand: string, codename: string): string | null {
  const dir = BRAND_DIRS[brand];
  if (!dir) return null;
  const name = CASINGS.get(`${brand}\0${codename.toLowerCase()}`) ?? codename;
  return `${SITE_ROOT}/${dir}/${name}.md`;
}

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
        referenceUrl: referenceFor(brand, codename),
        referenceKind: "derived",
      }),
    );
  }

  return records;
}
