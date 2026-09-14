import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "pixelos";
const ROM_NAME = "PixelOS";
const SOURCE = "pixelos.json";

interface RawPixelOSDevice {
  codename?: unknown;
  codename_alt?: unknown;
  vendor?: unknown;
  model?: unknown;
  maintainer_name?: unknown;
  active?: unknown;
  version?: unknown;
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
      normalizedRomDeviceSchema.parse({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(device.model),
        brand: str(device.vendor),
        romVersion: null,
        androidBase: str(device.version),
        active: device.active === true,
        maintainer: str(device.maintainer_name),
        sourceUrl: null,
        source: SOURCE,
      })
    );
  }

  return records;
}
