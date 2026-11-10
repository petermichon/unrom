import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "project-blaze";
const ROM_NAME = "Project Blaze";

const REFERENCE =
  "https://github.com/ProjectBlaze/official_devices/blob/14/devices.json";

// The roster lists three Xiaomi devices under its "Nothing" group.
const BRAND_FIXES: Record<string, string> = {
  marble: "Xiaomi",
  stone: "Xiaomi",
  veux: "Xiaomi",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Two entries pack several codenames (`onclite, onc`, `raven & oriole`).
function splitCodename(value: string): string[] {
  return value
    .split(/\s*(?:&|,|\/)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

interface BrandGroup {
  brand?: unknown;
  devices?: unknown;
}

/**
 * The roster is an array of brand groups, each with a `devices` object keyed by
 * index. Two codenames appear under more than one brand, so the first wins.
 */
export function parseProjectBlaze(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as unknown;
  const groups = Array.isArray(data) ? data : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const group of groups) {
    if (!isObject(group)) continue;
    const brand = str((group as BrandGroup).brand);
    const devices = (group as BrandGroup).devices;
    if (!isObject(devices)) continue;

    for (const device of Object.values(devices)) {
      if (!isObject(device)) continue;
      const reported = str(device.codename);
      if (!reported) continue;
      const parts = splitCodename(reported);
      const primary = parts[0];

      for (const codename of parts) {
        const key = codename.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        records.push(
          buildRecord({
            romId: ROM_ID,
            romName: ROM_NAME,
            codename,
            name: str(device.name),
            brand: BRAND_FIXES[codename.toLowerCase()] ?? brand,
            referenceUrl: REFERENCE,
            reportedCodename: primary,
          }),
        );
      }
    }
  }

  return records;
}
