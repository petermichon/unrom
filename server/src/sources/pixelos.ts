import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "pixelos";
const ROM_NAME = "PixelOS";
const SOURCE = "pixelos.json";

interface RawPixelOSDevice {
  codename?: unknown;
  codename_alt?: unknown;
  vendor?: unknown;
  model?: unknown;
}

function str(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function parsePixelOS(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { devices?: RawPixelOSDevice[] };
  const rawDevices = Array.isArray(data.devices) ? data.devices : [];

  const records: NormalizedRomDevice[] = [];
  for (const device of rawDevices) {
    const codename = str(device.codename);
    if (!codename) continue;

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(device.model),
        brand: str(device.vendor),
        source: SOURCE,
      }),
    );
  }

  return records;
}
