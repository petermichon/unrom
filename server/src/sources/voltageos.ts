import { buildRecord, normalizeDate, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "voltageos";
const ROM_NAME = "VoltageOS";

const REPO = "https://github.com/VoltageOS/android_vendor_voltageota/blob/17";

interface Build {
  device?: unknown;
  oem?: unknown;
  timestamp?: unknown;
}

interface DeviceFile {
  path?: unknown;
  device?: unknown;
}

/**
 * One build document per device at the repository root, keyed by codename. The
 * file keeps a history of builds; the newest one names the device and dates it.
 */
export function parseVoltageOS(raw: string): NormalizedRomDevice[] {
  const snapshot = JSON.parse(raw) as { files?: unknown };
  const files = Array.isArray(snapshot.files) ? snapshot.files : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    if (typeof file !== "object" || file === null) continue;
    const entry = file as DeviceFile;
    const path = typeof entry.path === "string" ? entry.path : null;
    if (!path || seen.has(path)) continue;

    const payload = entry.device as { response?: unknown } | undefined;
    const builds = Array.isArray(payload?.response)
      ? (payload.response as Build[])
      : [];
    if (builds.length === 0) continue;

    const newest = builds.reduce((best, build) => {
      const a = Number(build.timestamp) || 0;
      const b = Number(best.timestamp) || 0;
      return a > b ? build : best;
    });

    const codename = path.replace(/\.json$/i, "");
    if (!codename) continue;
    seen.add(path);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(newest.device),
        brand: str(newest.oem),
        buildDate: normalizeDate(newest.timestamp),
        referenceUrl: `${REPO}/${path}`,
      }),
    );
  }

  return records;
}
