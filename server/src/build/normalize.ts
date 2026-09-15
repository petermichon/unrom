import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { NormalizedRomDevice } from "../normalized.ts";
import { sources } from "../sources/registry.ts";
import { DATA_DIR, DIST_DIR, NDJSON_PATH } from "../paths.ts";

const records: NormalizedRomDevice[] = [];
let failures = 0;

for (const source of sources) {
  try {
    const raw = await readFile(join(DATA_DIR, source.file), "utf8");
    const parsed = source.parse(raw);
    records.push(...parsed);
    console.log(`✓ ${source.file} → ${parsed.length} record(s)`);
  } catch (error) {
    failures++;
    console.error(
      `✗ ${source.file}: ${error instanceof Error ? error.message : error}`
    );
  }
}

await mkdir(DIST_DIR, { recursive: true });
await writeFile(
  NDJSON_PATH,
  records.map((record) => JSON.stringify(record)).join("\n") +
    (records.length ? "\n" : ""),
  "utf8"
);

console.log(`\n${records.length} normalized record(s) → ${NDJSON_PATH}`);

if (failures > 0) {
  console.error(`${failures} of ${sources.length} source(s) failed`);
  process.exit(1);
}
