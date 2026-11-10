import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "tequila-os";
const ROM_NAME = "Tequila OS";

const REFERENCE =
  "https://github.com/tequilaOS/tequila_ota/blob/main/devices.json";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Devices are grouped by brand, then keyed by codename. `discontinued: true`
 * marks a device with no build in the final roster, so only the remainder is
 * current support for this ROM.
 */
export function parseTequilaOS(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as unknown;
  if (!isObject(data)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const [brand, group] of Object.entries(data)) {
    if (!isObject(group)) continue;

    for (const [codename, info] of Object.entries(group)) {
      if (!isObject(info) || info.discontinued === true) continue;
      if (seen.has(codename)) continue;
      seen.add(codename);

      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          codename,
          name: str(info.name),
          brand,
          referenceUrl: REFERENCE,
        }),
      );
    }
  }

  return records;
}
