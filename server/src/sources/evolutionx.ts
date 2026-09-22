import { buildRecord, isCitation, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "evolutionx";
const ROM_NAME = "Evolution X";

// `evolution-x.org/device/<codename>` is the official per-device page for every
// device in the roster except `stone`, which has no page and falls back to its
// device-specific XDA thread.
const UNPUBLISHED = new Set(["stone"]);

/** The Evolution X fetcher stores one build object per device. */
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

    const fallback = str(entry.forum) ?? str(entry.download);
    const referenceUrl = UNPUBLISHED.has(codename)
      ? isCitation(fallback)
        ? fallback
        : null
      : `https://evolution-x.org/device/${codename}`;

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(entry.device),
        brand: str(entry.oem),
        referenceUrl,
      }),
    );
  }

  return records;
}
