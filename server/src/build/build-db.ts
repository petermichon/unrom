import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { generateDdl } from "../db/ddl.ts";
import {
  devices,
  meta,
  romDeviceVersions,
  romDevices,
  roms,
} from "../db/schema.ts";
import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice } from "../normalized.ts";
import {
  DB_PATH,
  DIST_DIR,
  NDJSON_PATH,
  SCHEMA_SQL_PATH,
} from "../paths.ts";

const raw = await readFile(NDJSON_PATH, "utf8");
const records: NormalizedRomDevice[] = raw
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line) => normalizedRomDeviceSchema.parse(JSON.parse(line)));

const schemaSql = generateDdl();

await mkdir(DIST_DIR, { recursive: true });
// The DDL is derived from the schema and shipped alongside the exports.
await writeFile(SCHEMA_SQL_PATH, schemaSql, "utf8");
// Remove the DB and any WAL sidecars from a previous build.
await Promise.all(
  ["", "-wal", "-shm"].map((suffix) => rm(DB_PATH + suffix, { force: true }))
);

const sqlite = new Database(DB_PATH);
sqlite.pragma("foreign_keys = ON");
sqlite.exec(schemaSql);

const db = drizzle(sqlite);

// Aggregate devices (first non-null name/brand wins) and roms, then dedupe edges.
const deviceMap = new Map<
  string,
  { codename: string; name: string | null; brand: string | null }
>();
const romMap = new Map<string, string>();

interface Edge {
  romId: string;
  codename: string;
  active: boolean;
  maintainer: string | null;
  sourceUrl: string | null;
  source: string;
}
interface Version {
  romId: string;
  codename: string;
  romVersion: string | null;
  androidBase: string | null;
}

const edgeMap = new Map<string, Edge>();
const versionMap = new Map<string, Version>();

for (const record of records) {
  romMap.set(record.romId, record.romName);

  const device = deviceMap.get(record.codename) ?? {
    codename: record.codename,
    name: null,
    brand: null,
  };
  device.name ??= record.name;
  device.brand ??= record.brand;
  deviceMap.set(record.codename, device);

  const key = `${record.romId}:${record.codename}`;
  const edge = edgeMap.get(key) ?? {
    romId: record.romId,
    codename: record.codename,
    active: false,
    maintainer: null,
    sourceUrl: null,
    source: record.source,
  };
  // A ROM is active if any of its snapshots says so.
  edge.active ||= record.active;
  edge.maintainer ??= record.maintainer;
  edge.sourceUrl ??= record.sourceUrl;
  edgeMap.set(key, edge);

  for (const version of record.versions) {
    versionMap.set(
      `${key}:${version.romVersion ?? ""}:${version.androidBase ?? ""}`,
      {
        romId: record.romId,
        codename: record.codename,
        romVersion: version.romVersion,
        androidBase: version.androidBase,
      }
    );
  }
}

const edges = [...edgeMap.values()];
const versions = [...versionMap.values()];
// SOURCE_DATE_EPOCH makes rebuilds byte-identical (reproducible builds).
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
  : new Date().toISOString();
const metaRows: Array<[string, string]> = [
  ["generatedAt", generatedAt],
  ["deviceCount", String(deviceMap.size)],
  ["romCount", String(romMap.size)],
  ["edgeCount", String(edges.length)],
];

// One transaction: all-or-nothing, and far faster than per-row commits.
db.transaction((tx) => {
  for (const [id, name] of romMap) {
    tx.insert(roms).values({ id, name }).run();
  }
  for (const device of deviceMap.values()) {
    tx.insert(devices).values(device).run();
  }
  for (const edge of edges) {
    tx.insert(romDevices).values(edge).run();
  }
  for (const version of versions) {
    tx.insert(romDeviceVersions).values(version).run();
  }
  for (const [key, value] of metaRows) {
    tx.insert(meta).values({ key, value }).run();
  }
});

sqlite.close();

console.log(
  `Built ${DB_PATH}\n  ${romMap.size} ROM(s), ${deviceMap.size} device(s), ${edges.length} edge(s), ${versions.length} version(s)`
);
