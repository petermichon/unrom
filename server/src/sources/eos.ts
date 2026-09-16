import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "eos";
const ROM_NAME = "/e/OS";

/**
 * /e/OS publishes one GitLab CI file per branch. Each build job lists its
 * devices in a `DEVICES: "..."` variable; the branch determines the Android
 * base (v1-s = 12, v1-t = 13, a14/a15/a16).
 */
export function createEosParser(
  source: string,
  androidBase: string,
): (raw: string) => NormalizedRomDevice[] {
  return (raw: string) => {
    const records: NormalizedRomDevice[] = [];
    const seen = new Set<string>();

    for (const match of raw.matchAll(/DEVICES:\s*"([^"]*)"/g)) {
      for (const rawCodename of match[1].split(/\s+/)) {
        const codename = rawCodename.trim();
        if (!codename || seen.has(codename)) continue;
        seen.add(codename);

        records.push(
          buildRecord({
            romId: ROM_ID,
            romName: ROM_NAME,
            source,
            codename,
            androidBase,
          }),
        );
      }
    }

    return records;
  };
}
