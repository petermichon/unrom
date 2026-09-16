import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "havocos";
const ROM_NAME = "Havoc-OS";
const SOURCE = "havocos.txt";
// Raw data comes from the `thirteen` branch; the file itself has no version.
const ANDROID_BASE = "13";

/** havocos.txt is a plain list of device codenames, one per line. */
export function parseHavocOS(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const line of raw.split("\n")) {
    const codename = line.trim().replace(/^#.*$/, "");
    if (codename === "" || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        source: SOURCE,
        codename,
        androidBase: ANDROID_BASE,
        active: false,
      }),
    );
  }

  return records;
}
