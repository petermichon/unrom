import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "axp-os";
const ROM_NAME = "AXP.OS";

// The site mirror holds the markdown file each device page is generated from.
// GitHub paths are case-sensitive, so the citation uses the path verbatim.
const SITE = "https://github.com/AXP-OS/axpos-org/blob/hugo";
const DEVICE_FILE = /^content\/devices\/([^/]+)\/([^/]+)\.md$/;

interface TreeEntry {
  type?: string;
  path?: string;
}

/**
 * The project's site tree lists one `content/devices/<Brand>/<codename>.md` per
 * supported device. Other files share the directory: `_index.md`, per-variant
 * build files (`fp_<codename>_pro`) and installation guides. Only a file one
 * directory below `content/devices` is a device.
 */
export function parseAxpOs(raw: string): NormalizedRomDevice[] {
  const parsed = JSON.parse(raw) as { tree?: TreeEntry[] };
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of parsed.tree ?? []) {
    if (entry.type !== "blob") continue;
    const path = entry.path ?? "";
    const match = DEVICE_FILE.exec(path);
    if (!match) continue;

    const [, brand, codename] = match;
    // The changelog pages and section indexes share the directory but are not
    // devices.
    if (brand.toLowerCase() === "changelogs") continue;
    if (codename === "_index") continue;
    if (seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        brand: brand.toLowerCase(),
        referenceUrl: `${SITE}/${path}`,
        referenceKind: "derived",
      }),
    );
  }

  return records;
}
