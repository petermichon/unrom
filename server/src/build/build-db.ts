import { mkdir, readFile, writeFile } from "node:fs/promises";

import { buildDatabase } from "./database.ts";
import { generateDdl } from "../db/ddl.ts";
import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice } from "../normalized.ts";
import {
  ALIASES_PATH,
  DB_PATH,
  DIST_DIR,
  NDJSON_PATH,
  REGISTRY_REPORT_PATH,
  SCHEMA_SQL_PATH,
} from "../paths.ts";

const raw = await readFile(NDJSON_PATH, "utf8");
const records: NormalizedRomDevice[] = raw
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => normalizedRomDeviceSchema.parse(JSON.parse(line)));

await mkdir(DIST_DIR, { recursive: true });
// The DDL is derived from the schema and shipped alongside the exports.
await writeFile(SCHEMA_SQL_PATH, generateDdl(), "utf8");

const result = buildDatabase(records, DB_PATH);

// Alias resolution is a generation-time normalization; the resolved mapping is
// emitted as a reviewable artifact rather than stored in the DB.
await writeFile(
  ALIASES_PATH,
  JSON.stringify(result.aliases, null, 2) + "\n",
  "utf8"
);

// Curation backlog: source names for uncurated devices, with conflicts flagged
// so the registry can be grown incrementally.
await writeFile(
  REGISTRY_REPORT_PATH,
  JSON.stringify(result.registryReport, null, 2) + "\n",
  "utf8"
);

const report = result.registryReport.summary;
console.log(
  `Built ${DB_PATH}\n  ${result.romCount} ROM(s), ${result.deviceCount} device(s), ` +
    `${result.edgeCount} edge(s), ${result.registryCount} registry entr(ies), ` +
    `${result.aliases.length} alias(es)\n` +
    `  Registry: ${report.curated} curated, ${report.fallback} fallback, ` +
    `${report.unnamed} unnamed, ${report.conflicts} conflict(s), ` +
    `${report.suspicious} suspicious → ${REGISTRY_REPORT_PATH}`
);
