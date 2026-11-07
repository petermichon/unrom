import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "lineageos-microg";
const ROM_NAME = "LineageOS for microG";
const BASE_URL = "https://download.lineage.microg.org";

// The build host also publishes directories that are not devices.
const NON_DEVICE_DIRS = new Set(["builds", "iodeos", "lineageos"]);

/**
 * The official download host is an Apache directory index; each supported
 * device is a top-level directory named by its codename.
 */
export function parseLineageOSMicroG(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const match of raw.matchAll(/href="\.\/([^"/]+)\/"/g)) {
    const codename = match[1].trim();
    if (!codename || NON_DEVICE_DIRS.has(codename.toLowerCase())) continue;
    if (seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        referenceUrl: `${BASE_URL}/${codename}/`,
      }),
    );
  }

  return records;
}
