import { buildRecord, normalizeDate } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "superioros";
const ROM_NAME = "SuperiorOS";
const REPO = "SuperiorOS-Devices/official_devices";
const BRANCH = "fourteen";

interface SuperiorDevice {
  file?: string;
  raw?: {
    response?: Array<{ device_name?: string; datetime?: unknown }>;
  };
}

/** The fetcher embeds each per-device OTA JSON in one snapshot. */
export function parseSuperiorOS(raw: string): NormalizedRomDevice[] {
  const parsed = JSON.parse(raw) as { devices?: SuperiorDevice[] };
  const records: NormalizedRomDevice[] = [];

  for (const device of parsed.devices ?? []) {
    const file = device.file;
    const newest = device.raw?.response?.[0];
    const name = newest?.device_name;
    if (!file?.endsWith(".json") || !name) continue;

    const codename = file.slice(0, -".json".length);
    if (!codename.includes("/")) {
      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          codename,
          name: name.trim(),
          referenceUrl: `https://github.com/${REPO}/blob/${BRANCH}/${file}`,
          buildDate: normalizeDate(newest?.datetime),
        }),
      );
    }
  }

  return records;
}
