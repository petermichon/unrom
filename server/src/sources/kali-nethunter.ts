import { parse as parseYaml } from "yaml";

import { androidBase, buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "kali-nethunter";
const ROM_NAME = "Kali NetHunter";
const SOURCE = "kali-nethunter.yml";

interface KaliVersion {
  android?: unknown;
  author?: unknown;
}

interface KaliKernel {
  versions?: KaliVersion[];
}

interface KaliDevice {
  model?: unknown;
  kernels?: KaliKernel[];
}

/**
 * kali-nethunter.yml is a list of single-key maps: `- <codename>: { model,
 * kernels: [{ versions: [{ android, author }] }] }`.
 */
export function parseKaliNetHunter(raw: string): NormalizedRomDevice[] {
  const document: unknown = parseYaml(raw);
  if (!Array.isArray(document)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of document) {
    if (!entry || typeof entry !== "object") continue;

    for (const [codename, value] of Object.entries(
      entry as Record<string, unknown>
    )) {
      if (seen.has(codename)) continue;
      seen.add(codename);

      const device = (value ?? {}) as KaliDevice;
      const bases: string[] = [];
      let maintainer: string | null = null;

      for (const kernel of device.kernels ?? []) {
        for (const version of kernel.versions ?? []) {
          const base = androidBase(version.android);
          if (base && !bases.includes(base)) bases.push(base);
          maintainer ??= str(version.author);
        }
      }

      records.push(
        buildRecord({
          romId: ROM_ID,
          romName: ROM_NAME,
          source: SOURCE,
          codename,
          name: str(device.model),
          maintainer,
          versions: bases.map((base) => ({ androidBase: base, romVersion: null })),
        })
      );
    }
  }

  return records;
}
