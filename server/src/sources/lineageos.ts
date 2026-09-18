import { parse as parseYaml } from "yaml";

import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "lineageos";
const ROM_NAME = "LineageOS";

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
        codename,
        name: str(meta.name),
        brand: str(meta.vendor),
        referenceUrl: `https://wiki.lineageos.org/devices/${codename}/`,
      }),
    );
  }

  return records;
}
