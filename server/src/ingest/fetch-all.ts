import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { DATA_DIR } from "../paths.ts";
import { mapLimit } from "./fetch/util.ts";
import {
  readSourceHealth,
  updateHealth,
  writeSourceHealth,
  type SourceAttempt,
} from "./health.ts";
import { sources } from "./sources.ts";

const only = process.argv.slice(2);
const selected = only.length
  ? sources.filter((source) => only.includes(source.id))
  : sources;

if (only.length && selected.length === 0) {
  console.error(`No matching sources for: ${only.join(", ")}`);
  console.error(`Available: ${sources.map((source) => source.id).join(", ")}`);
  process.exit(1);
}

await mkdir(DATA_DIR, { recursive: true });
console.log(`Writing raw data to ${DATA_DIR}\n`);

const attempts: SourceAttempt[] = new Array(selected.length);

// A bounded number of sources at once: each adapter may fan out further, and
// an unbounded start means hundreds of simultaneous requests upstream.
await mapLimit(selected, 4, async ({ id, file, fetch }, index) => {
  try {
    const result = await fetch();
    if (result instanceof Error) {
      attempts[index] = { id, file, ok: false, error: result.message };
      console.error(`✗ ${id}: ${result.message}`);
      return;
    }
    await writeFile(join(DATA_DIR, file), result, "utf8");
    attempts[index] = { id, file, ok: true };
    console.log(`✓ ${id} → ${file}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    attempts[index] = { id, file, ok: false, error: message };
    console.error(`✗ ${id}: ${message}`);
  }
});

const failures = attempts.filter((attempt) => !attempt.ok).length;

// Record what answered even when some sources failed: the audit needs to know
// which snapshot went quiet and why. A full run also drops entries for sources
// the registry no longer fetches; a single-source run leaves the rest alone.
const previous = await readSourceHealth();
const health = updateHealth(previous, attempts, new Date());
const recorded = only.length
  ? health
  : health.filter((entry) =>
      selected.some((source) => source.file === entry.file),
    );
await writeSourceHealth(recorded);

if (failures > 0) {
  console.error(`\n${failures} of ${selected.length} source(s) failed`);
  process.exit(1);
}

console.log(`\nFetched ${selected.length} source(s)`);
