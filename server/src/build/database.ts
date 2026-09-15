import { rmSync } from "node:fs";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { createCodenameResolver } from "../data/aliases.ts";
import { generateDdl } from "../db/ddl.ts";
import {
  aliases,
  devices,
  meta,
  romDeviceVersions,
  romDevices,
  roms,
} from "../db/schema.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

export interface BuildResult {
  romCount: number;
  deviceCount: number;
  edgeCount: number;
  versionCount: number;
  aliasCount: number;
  generatedAt: string;
}

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

/** Build the disposable SQLite database from normalized records. */
export function buildDatabase(
  records: NormalizedRomDevice[],
  dbPath: string
): BuildResult {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(dbPath + suffix, { force: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(generateDdl());
  const db = drizzle(sqlite);

  // Aggregate devices (first non-null name/brand wins) and roms.
  const deviceMap = new Map<
    string,
    { codename: string; name: string | null; brand: string | null }
  >();
  const romMap = new Map<string, string>();
  const edgeMap = new Map<string, Edge>();
  const versionMap = new Map<string, Version>();
  const codenames = createCodenameResolver();

  for (const record of records) {
    romMap.set(record.romId, record.romName);

    // Resolve cross-source casing to one canonical device identity.
    const codename = codenames.resolve(record.codename);

    const device = deviceMap.get(codename) ?? {
      codename,
      name: null,
      brand: null,
    };
    device.name ??= record.name;
    device.brand ??= record.brand;
    deviceMap.set(codename, device);

    const key = `${record.romId}:${codename}`;
    const edge = edgeMap.get(key) ?? {
      romId: record.romId,
      codename,
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
          codename,
          romVersion: version.romVersion,
          androidBase: version.androidBase,
        }
      );
    }
  }

  const edges = [...edgeMap.values()];
  const versions = [...versionMap.values()];
  const aliasRows = codenames.aliases();

  // SOURCE_DATE_EPOCH makes rebuilds deterministic (reproducible builds).
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
    for (const alias of aliasRows) {
      tx.insert(aliases).values(alias).run();
    }
    for (const [key, value] of metaRows) {
      tx.insert(meta).values({ key, value }).run();
    }
  });

  sqlite.close();

  return {
    romCount: romMap.size,
    deviceCount: deviceMap.size,
    edgeCount: edges.length,
    versionCount: versions.length,
    aliasCount: aliasRows.length,
    generatedAt,
  };
}
