import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "pixelos";
const ROM_NAME = "PixelOS";

interface RawPixelOSDevice {
  codename?: unknown;
  codename_alt?: unknown;
  vendor?: unknown;
  model?: unknown;
  download_link?: unknown;
  last_updated?: unknown;
}

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

/**
 * The build's date, from the dated filename first and the human `last_updated`
 * second. The filename is unambiguous; `21 August 2024` has no timezone, so it
 * is read by pattern rather than through `Date`, which would shift the day.
 */
function buildDateFor(device: RawPixelOSDevice): string | null {
  const link = str(device.download_link);
  const stamp = link?.match(/[_-](\d{4})(\d{2})(\d{2})-/);
  if (stamp) return `${stamp[1]}-${stamp[2]}-${stamp[3]}`;

  const updated = str(device.last_updated)?.toLowerCase();
  const parts = updated?.match(/^(\d{1,2}) ([a-z]+) (\d{4})$/);
  const month = parts ? MONTHS[parts[2]!] : undefined;
  if (!parts || !month) return null;
  return `${parts[3]}-${month}-${parts[1]!.padStart(2, "0")}`;
}

export function parsePixelOS(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { devices?: RawPixelOSDevice[] };
  const rawDevices = Array.isArray(data.devices) ? data.devices : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const device of rawDevices) {
    const codename = str(device.codename);
    if (!codename) continue;

    // PixelOS publishes a device file as soon as the device is accepted, before
    // its first build exists: the entry is `active: true` but carries an empty
    // `download_link`, and pixelos.net then renders "No build available yet".
    // A build cannot exist without a link, so the entry is kept for its name
    // evidence but contributes no build edge (see `hasBuild`).
    const hasBuild = str(device.download_link) !== null;

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
        referenceKind: "derived",
        hasBuild,
        buildDate: hasBuild ? buildDateFor(device) : null,
      }),
    );
  }

  return records;
}
