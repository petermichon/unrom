import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "yaap-aosp";
const ROM_NAME = "YAAP AOSP";

interface SnapshotFile {
  path?: unknown;
  device?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * `device-info` stores one document per device at `<codename>/<codename>.json`.
 * The directory name is the only codename the file carries.
 */
export function parseYaap(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { files?: SnapshotFile[] };
  const files = Array.isArray(data.files) ? data.files : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    if (!isObject(file) || !isObject(file.device)) continue;
    const path = typeof file.path === "string" ? file.path : null;
    if (!path) continue;

    const codename = path.split("/")[0];
    if (!codename || seen.has(codename)) continue;

    // Retired entries stay in the repository with a non-Active status.
    const status = str(file.device.status);
    if (status && status.toLowerCase() !== "active") continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(file.device.name),
        referenceUrl: `https://github.com/yaap/device-info/blob/master/${path}`,
      }),
    );
  }

  return records;
}
