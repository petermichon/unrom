import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "alphadroid";
const ROM_NAME = "AlphaDroid";

// The roster carries no per-device citations, so cite the pinned source file.
const REFERENCE =
  "https://github.com/AlphaDroid-devices/official_devices/blob/main/devices.md";

// Upstream typos that would otherwise create devices no build can target.
const CODENAME_FIXES: Record<string, string> = {
  instanoodle: "instantnoodle",
  instanoodlep: "instantnoodlep",
  poridot: "peridot",
};

// Pixel 6a is `bluejay`; the roster reuses Pixel 6's `oriole`.
const NAME_CODENAME_FIXES: Record<string, string> = {
  "Pixel 6a": "bluejay",
};

/**
 * alphadroid.md groups devices under `## <brand>` headings:
 * `- **Device (codename[, codename])**`.
 */
export function parseAlphaDroid(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();
  let brand: string | null = null;

  for (const line of raw.split("\n")) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      brand = heading[1].trim();
      continue;
    }

    const entry = line.match(/^-\s+\*\*(.+?)\*\*\s*$/);
    if (!entry) continue;

    const label = entry[1].trim();
    const groups = [...label.matchAll(/\(([^)]+)\)/g)];
    const last = groups.at(-1)?.[1];
    if (!last) continue;

    const name = label.slice(0, label.lastIndexOf("(")).trim() || null;
    const reported = NAME_CODENAME_FIXES[name ?? ""]
      ? [NAME_CODENAME_FIXES[name ?? ""]!]
      : last
          .split(/[,/]/)
          .map((part) => part.trim())
          .filter(Boolean);
    const primary = reported[0]
      ? (CODENAME_FIXES[reported[0]] ?? reported[0])
      : undefined;

    for (const rawCodename of reported) {
      const corrected = CODENAME_FIXES[rawCodename];
      const codename = corrected ?? rawCodename;
      if (seen.has(codename)) continue;
      seen.add(codename);

      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          codename,
          name,
          brand,
          referenceUrl: REFERENCE,
          // Do not treat an upstream typo as a real covering target.
          reportedCodename: corrected ? null : primary,
        }),
      );
    }
  }

  return records;
}

interface SiteDevice {
  name?: unknown;
  data?: { response?: unknown };
}

interface SiteBuild {
  oem?: unknown;
  device?: unknown;
}

/**
 * The website keeps every official build under `data/devices.json`, one entry
 * per device file (`<codename>.json`). It is a superset of `devices.md`, so
 * both are normalized to catch devices the markdown roster has not listed yet.
 */
export function parseAlphaDroidJson(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { devices?: unknown };
  const devices = Array.isArray(data.devices) ? data.devices : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of devices) {
    if (!entry || typeof entry !== "object") continue;
    const device = entry as SiteDevice;
    const file = str(device.name);
    if (!file) continue;

    const codename = file.replace(/\.json$/i, "");
    if (!codename || seen.has(codename)) continue;

    const response = device.data?.response;
    const build =
      Array.isArray(response) && response[0] && typeof response[0] === "object"
        ? (response[0] as SiteBuild)
        : null;
    const reportedName = str(build?.device);
    const name =
      reportedName && reportedName.toLowerCase() !== codename.toLowerCase()
        ? reportedName
        : null;

    seen.add(codename);
    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name,
        brand: str(build?.oem),
        referenceUrl: `https://alphadroid.org/#devices?codename=${codename}`,
        referenceKind: "derived",
      }),
    );
  }

  return records;
}
