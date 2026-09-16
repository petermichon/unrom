import { parse as parseYaml } from "yaml";

import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "kenvyra";
const ROM_NAME = "Kenvyra";
const SOURCE = "kenvyra.json";

interface Frontmatter {
  name?: unknown;
  codename?: unknown;
  manufacturer?: unknown;
  maintainers?: unknown;
}

/**
 * kenvyra.json is an array of Markdown documents, each with a YAML frontmatter
 * block holding the device metadata.
 */
export function parseKenvyra(raw: string): NormalizedRomDevice[] {
  const documents = JSON.parse(raw) as unknown;
  if (!Array.isArray(documents)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const document of documents) {
    if (typeof document !== "string") continue;
    const block = document.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!block) continue;

    const meta = parseYaml(block[1]) as Frontmatter;
    const codename = str(meta.codename);
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        source: SOURCE,
        codename,
        name: str(meta.name),
        brand: str(meta.manufacturer),
        maintainer: str(meta.maintainers),
      }),
    );
  }

  return records;
}
