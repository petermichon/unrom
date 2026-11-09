import { parse as parseYaml } from "yaml";

import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "lineageos";
const ROM_NAME = "LineageOS";

/**
 * The LineageOS fetcher stores the raw wiki YAML for each device; here we parse
 * each document. A codename can appear several times with a numeric `variant`
 * (one model per variant, e.g. `otter` = SHIFTphone 8.0 and 8.1), so documents
 * are merged per codename and every reported model name is kept.
 */
export function parseLineageOS(raw: string): NormalizedRomDevice[] {
  const documents = JSON.parse(raw) as unknown;
  if (!Array.isArray(documents)) return [];

  const merged = new Map<
    string,
    { name: string | null; names: string[]; brand: string | null }
  >();

  for (const document of documents) {
    if (typeof document !== "string") continue;

    const meta = parseYaml(document) as Record<string, unknown>;
    const codename = str(meta.codename);
    if (!codename) continue;

    const entry = merged.get(codename) ?? {
      name: null,
      names: [],
      brand: str(meta.vendor),
    };
    const name = str(meta.name);
    if (name) {
      if (!entry.name) entry.name = name;
      if (!entry.names.includes(name)) entry.names.push(name);
    }
    merged.set(codename, entry);
  }

  return [...merged].map(([codename, entry]) =>
    buildRecord({
      romId: ROM_ID,
      romName: ROM_NAME,
      codename,
      name: entry.name,
      names: entry.names,
      brand: entry.brand,
      referenceUrl: `https://wiki.lineageos.org/devices/${codename}/`,
      referenceKind: "derived",
    }),
  );
}
