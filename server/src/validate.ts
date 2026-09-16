import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { NormalizedRomDevice } from "./normalized.ts";
import { sources } from "./sources/registry.ts";
import type { SourceAdapter } from "./sources/registry.ts";
import { DATA_DIR } from "./paths.ts";

export interface SourceResult {
  id: string;
  file: string;
  records: number;
  error?: string;
}

async function parseSource(source: SourceAdapter): Promise<SourceResult> {
  try {
    const raw = await readFile(join(DATA_DIR, source.file), "utf8");
    return {
      id: source.id,
      file: source.file,
      records: source.parse(raw).length,
    };
  } catch (error) {
    return {
      id: source.id,
      file: source.file,
      records: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function validateSources(): Promise<SourceResult[]> {
  return Promise.all(sources.map(parseSource));
}

export async function parseAllSources(): Promise<NormalizedRomDevice[]> {
  const records: NormalizedRomDevice[] = [];
  for (const source of sources) {
    const raw = await readFile(join(DATA_DIR, source.file), "utf8");
    records.push(...source.parse(raw));
  }
  return records;
}

/** Raw snapshot files present on disk (excluding dotfiles). */
export async function listDataFiles(): Promise<string[]> {
  const entries = await readdir(DATA_DIR);
  return entries.filter((name) => !name.startsWith(".")).sort();
}
