import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "axionaosp";
const ROM_NAME = "AxionOS";

interface Device {
  codename?: unknown;
  name?: unknown;
  brand?: unknown;
  status?: unknown;
}

/**
 * `api/downloads.json` is generated from the project's device registry. It
 * carries one entry per device with its own `active`/`inactive` status; only
 * active devices are current official builds.
 */
export function parseAxionOs(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { devices?: unknown };
  const devices = Array.isArray(data.devices) ? data.devices : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of devices) {
    if (!entry || typeof entry !== "object") continue;
    const device = entry as Device;
    const codename = str(device.codename);
    if (!codename || seen.has(codename)) continue;
    if (str(device.status) !== "active") continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(device.name),
        brand: str(device.brand),
        referenceUrl: `https://www.axionos.org/download/${codename}`,
        referenceKind: "derived",
      }),
    );
  }

  return records;
}
