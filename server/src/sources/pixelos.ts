import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "pixelos";
const ROM_NAME = "PixelOS";

interface RawPixelOSDevice {
  codename?: unknown;
  codename_alt?: unknown;
  vendor?: unknown;
  model?: unknown;
}

export function parsePixelOS(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { devices?: RawPixelOSDevice[] };
  const rawDevices = Array.isArray(data.devices) ? data.devices : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const device of rawDevices) {
    const codename = str(device.codename);
    if (!codename) continue;
    if (seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(device.model),
        brand: str(device.vendor),
        referenceUrl: `https://pixelos.net/download/${codename}`,
      }),
    );
  }

  return records;
}
