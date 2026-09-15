import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "arrowos";
const ROM_NAME = "ArrowOS";
const SOURCE = "arrowos.txt";
// Raw data comes from the `arrow-13.1` branch; the file itself has no version.
const ANDROID_BASE = "13";

/**
 * arrow.devices lines: `<buildtype-prefix> <codename> <buildtype> <chipset>`,
 * where the codename may be prefixed with a node marker (`$@!^`).
 */
export function parseArrowOS(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    // A leading node marker (`$@!^`) is its own token, e.g. `! apollo userdebug`.
    const tokens = trimmed.split(/\s+/).filter((token) => token !== "");
    const codename =
      tokens[0] !== undefined && /^[$@!^]+$/.test(tokens[0])
        ? tokens[1]
        : tokens[0];
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        source: SOURCE,
        codename,
        androidBase: ANDROID_BASE,
        active: false,
      })
    );
  }

  return records;
}
