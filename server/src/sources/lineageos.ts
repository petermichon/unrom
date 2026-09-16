import { parse as parseYaml } from "yaml";

import { androidBase, buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "lineageos";
const ROM_NAME = "LineageOS";
const SOURCE = "lineageos.json";

// LineageOS release -> Android base. Only the versions currently in the wiki
// are mapped; unknown ones fall back to `androidBase`.
const LINEAGE_VERSIONS: Record<string, string> = {
  "14.1": "7",
  "15.1": "8",
  "16.0": "9",
  "17.1": "10",
  "18.1": "11",
  "19.1": "12",
  "20": "13",
  "20.0": "13",
  "21": "14",
  "21.0": "14",
  "22": "15",
  "22.0": "15",
  "22.1": "15",
  "22.2": "15",
  "23": "16",
  "23.0": "16",
};

// Keep each LineageOS release with its Android base (e.g. 22 -> 15).
function versionPairs(versions: unknown) {
  if (!Array.isArray(versions)) return [];
  return versions.map((version) => {
    const romVersion = String(version).trim();
    return {
      romVersion,
      androidBase: LINEAGE_VERSIONS[romVersion] ?? androidBase(version),
    };
  });
}

/**
 * The LineageOS fetcher stores the raw wiki YAML for each device; here we parse
 * each document and keep the first entry per codename.
 */
export function parseLineageOS(raw: string): NormalizedRomDevice[] {
  const documents = JSON.parse(raw) as unknown;
  if (!Array.isArray(documents)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const document of documents) {
    if (typeof document !== "string") continue;

    const meta = parseYaml(document) as Record<string, unknown>;
    const codename = str(meta.codename);
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        source: SOURCE,
        codename,
        name: str(meta.name),
        brand: str(meta.vendor),
        maintainer: str(meta.maintainers),
        versions: versionPairs(meta.versions),
        sourceUrl: `https://wiki.lineageos.org/devices/${codename}/`,
      }),
    );
  }

  return records;
}
