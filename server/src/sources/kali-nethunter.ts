import { parse as parseYaml } from "yaml";

import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "kali-nethunter";
const ROM_NAME = "Kali NetHunter";

// Kali keys some entries by build variant rather than device — e.g. `surya-16`
// is the PixelOS/Android-16 kernel for `surya`, and `oneplus-nord` is `avicii`.
// The entry's own `devicenames` names the real device; map the known variant
// keys so they never become phantom devices.
const KEY_CODENAMES: Record<string, string[]> = {
  "ailsa-ii": ["ailsa_ii"],
  "bluejay-los": ["bluejay"],
  gemini4g: ["geminipda"],
  "htc-pmewl": ["htc_pmewl"],
  "jasmine-sprout": ["jasmine_sprout"],
  "laurel-sprout": ["laurel_sprout"],
  on7xlte: ["j7prime"],
  onem7gpe: ["m7"],
  onem8gpe: ["m8"],
  "oneplus-nord": ["avicii"],
  oneplus1: ["bacon"],
  oneplus6: ["enchilada", "fajita"],
  oneplusx: ["onyx"],
  pdx201: ["seine"],
  "rmx1971-rui2": ["RMX1971"],
  spes_matrixx: ["spes"],
  "stone-crdroid12": ["stone"],
  "surya-16": ["surya"],
  ticwatchpro: ["catfish"],
  ticwatchpro3: ["rubyfish"],
};

interface KaliDevice {
  model?: unknown;
}

/**
 * kali-nethunter.yml is a list of single-key maps: `- <codename>: { model, … }`.
 */
export function parseKaliNetHunter(raw: string): NormalizedRomDevice[] {
  const document: unknown = parseYaml(raw);
  if (!Array.isArray(document)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of document) {
    if (!entry || typeof entry !== "object") continue;

    for (const [key, value] of Object.entries(
      entry as Record<string, unknown>,
    )) {
      const device = (value ?? {}) as KaliDevice;
      const name = str(device.model);

      for (const codename of KEY_CODENAMES[key] ?? [key]) {
        if (seen.has(codename)) continue;
        seen.add(codename);

        records.push(
          buildRecord({
            romId: ROM_ID,
            romName: ROM_NAME,
            codename,
            name,
            referenceUrl:
              "https://gitlab.com/kalilinux/nethunter/build-scripts/kali-nethunter-kernels/-/blob/main/devices.yml",
          }),
        );
      }
    }
  }

  return records;
}
