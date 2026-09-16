import { asBool, buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "evolutionx";
const ROM_NAME = "Evolution X";
const SOURCE = "evolutionx.json";

/**
 * The Evolution X fetcher stores one build object per device, with the codename
 * taken from the file name. The Android base is only in the file name
 * (`EvolutionX-16.0-...`).
 */
export function parseEvolutionX(raw: string): NormalizedRomDevice[] {
  const devices = JSON.parse(raw) as unknown;
  if (!Array.isArray(devices)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const device of devices) {
    if (!device || typeof device !== "object") continue;
    const entry = device as Record<string, unknown>;

    const codename = str(entry.codename);
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    const base =
      String(entry.filename ?? "").match(/EvolutionX-(\d+)/)?.[1] ?? null;

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        source: SOURCE,
        codename,
        name: str(entry.device),
        brand: str(entry.oem),
        maintainer: str(entry.maintainer),
        active: asBool(entry.currently_maintained, true),
        androidBase: base,
        sourceUrl: str(entry.forum) ?? str(entry.download),
      }),
    );
  }

  return records;
}
