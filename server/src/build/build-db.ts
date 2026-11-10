import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { buildDatabase } from "./database.ts";
import { generateDdl } from "../db/ddl.ts";
import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice } from "../normalized.ts";
import {
  ALIASES_PATH,
  DATA_DIR,
  DB_PATH,
  DIST_DIR,
  NDJSON_PATH,
  REFERENCE_OVERRIDES_PATH,
  REGISTRY_REPORT_PATH,
  SCHEMA_SQL_PATH,
} from "../paths.ts";
import { readDeadReferences } from "../data/reference-overrides.ts";
import { selectCatalog } from "../sources/catalog.ts";
import {
  PLAY_DEVICES_FILE,
  parsePlayDevices,
} from "../sources/play-devices.ts";

const raw = await readFile(NDJSON_PATH, "utf8");
const records: NormalizedRomDevice[] = raw
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => normalizedRomDeviceSchema.parse(JSON.parse(line)));

await mkdir(DIST_DIR, { recursive: true });
// The DDL is derived from the schema and shipped alongside the exports.
await writeFile(SCHEMA_SQL_PATH, generateDdl(), "utf8");

// The Play snapshot supplies most of the catalogue. A missing file would
// silently shrink the dataset by thousands of devices, so fail loudly.
const catalogPath = join(DATA_DIR, PLAY_DEVICES_FILE);
if (!existsSync(catalogPath)) {
  throw new Error(
    `Missing ${catalogPath}. Fetch it with: npm run ingest -- play-devices`,
  );
}
const catalog = selectCatalog(
  parsePlayDevices(await readFile(catalogPath, "utf8")),
).entries;

// Every artifact built from this snapshot must report the same freshness, so
// take the time from the normalized file rather than this run.
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : (await stat(NDJSON_PATH)).mtime.toISOString();

const result = buildDatabase(
  records,
  DB_PATH,
  catalog.map((entry) => ({
    vendor: entry.vendor,
    codename: entry.codename,
    names: entry.names,
  })),
  readDeadReferences(REFERENCE_OVERRIDES_PATH),
  generatedAt,
);

// Alias resolution is a generation-time normalization; the resolved mapping is
// emitted as a reviewable artifact rather than stored in the DB.
await writeFile(
  ALIASES_PATH,
  JSON.stringify(result.aliases, null, 2) + "\n",
  "utf8",
);

// Curation backlog: source names for uncurated devices, with conflicts flagged
// so the registry can be grown incrementally.
await writeFile(
  REGISTRY_REPORT_PATH,
  JSON.stringify(result.registryReport, null, 2) + "\n",
  "utf8",
);

const report = result.registryReport.summary;
console.log(
  `Built ${DB_PATH}\n  ${result.romCount} ROM(s), ${result.deviceCount} device(s), ` +
    `${result.catalogCount} catalogue seed(s), ` +
    `${result.edgeCount} edge(s), ${result.registryCount} registry entr(ies), ` +
    `${result.aliases.length} alias(es)\n` +
    `  Registry: ${report.curated} curated, ${report.sourceNamed} source-named, ` +
    `${report.unnamed} unnamed, ${report.conflicts} conflict(s), ` +
    `${report.suspicious} suspicious → ${REGISTRY_REPORT_PATH}`,
);
