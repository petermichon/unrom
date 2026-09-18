import { parse as parseYaml } from "yaml";

import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "kali-nethunter";
const ROM_NAME = "Kali NetHunter";
const SOURCE = "kali-nethunter.yml";

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

    for (const [codename, value] of Object.entries(
      entry as Record<string, unknown>,
    )) {
      if (seen.has(codename)) continue;
      seen.add(codename);

      const device = (value ?? {}) as KaliDevice;
      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          source: SOURCE,
          codename,
          name: str(device.model),
          referenceUrl:
            "https://gitlab.com/kalilinux/nethunter/build-scripts/kali-nethunter-kernels/-/blob/main/devices.yml",
        }),
      );
    }
  }

  return records;
}
