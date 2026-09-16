import { rmSync } from "node:fs";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  CANONICAL_CODENAMES,
  UNKNOWN_VENDOR,
  canonicalCodename,
  expandCodename,
  vendorForBrand,
  vendorForCodename,
  vendorForName,
} from "../data/identity.ts";
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

interface Device {
  vendor: string;
  codename: string;
  name: string | null;
  brand: string | null;
}

interface Edge {
  romId: string;
  vendor: string;
  codename: string;
  active: boolean;
  maintainer: string | null;
  sourceUrl: string | null;
  source: string;
}

interface Version {
  romId: string;
  vendor: string;
  codename: string;
  romVersion: string | null;
  androidBase: string | null;
}

interface Alias {
  vendor: string;
  alias: string;
  codename: string;
}

interface Prepared {
  record: NormalizedRomDevice;
  part: string;
  canonical: string;
  vendor: string | null;
}

function soleVendor(vendors: Set<string> | undefined): string | null {
  return vendors && vendors.size === 1 ? [...vendors][0] : null;
}

/** Build the disposable SQLite database from normalized records. */
export function buildDatabase(
  records: NormalizedRomDevice[],
  dbPath: string,
): BuildResult {
  for (const suffix of ["", "-wal", "-shm"]) {
    rmSync(dbPath + suffix, { force: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(generateDdl());
  const db = drizzle(sqlite);

  // Canonical casing: explicit overrides, then first-seen wins.
  const casing = new Map<string, string>();
  const canonicalCasing = (raw: string): string => {
    const value =
      CANONICAL_CODENAMES[raw] ?? casing.get(raw.toLowerCase()) ?? raw;
    casing.set(raw.toLowerCase(), value);
    return value;
  };

  // Expand combined codenames, resolve casing, and learn each codename's
  // vendor from the records that report a brand (used to fill brand-less ones).
  const prepared: Prepared[] = [];
  const vendorsByCodename = new Map<string, Set<string>>();
  for (const record of records) {
    const reportedVendor =
      vendorForBrand(record.brand) ?? vendorForName(record.name);
    for (const part of expandCodename(record.codename)) {
      const canonical = canonicalCasing(part);
      prepared.push({ record, part, canonical, vendor: reportedVendor });
      if (reportedVendor) {
        const vendors = vendorsByCodename.get(canonical) ?? new Set<string>();
        vendors.add(reportedVendor);
        vendorsByCodename.set(canonical, vendors);
      }
    }
  }

  const deviceMap = new Map<string, Device>();
  const romMap = new Map<string, string>();
  const edgeMap = new Map<string, Edge>();
  const versionMap = new Map<string, Version>();
  const aliasMap = new Map<string, Alias>();

  for (const { record, part, canonical, vendor: reported } of prepared) {
    romMap.set(record.romId, record.romName);

    const inherited =
      soleVendor(vendorsByCodename.get(canonical)) ??
      vendorForCodename(canonical);
    const vendor = reported ?? inherited ?? UNKNOWN_VENDOR;
    const resolved = canonicalCodename(vendor, canonical);
    const deviceKey = `${vendor}\0${resolved}`;

    const device = deviceMap.get(deviceKey) ?? {
      vendor,
      codename: resolved,
      name: null,
      brand: null,
    };
    device.name ??= record.name;
    device.brand ??= record.brand;
    deviceMap.set(deviceKey, device);

    if (part !== resolved) {
      aliasMap.set(`${vendor}\0${part}`, {
        vendor,
        alias: part,
        codename: resolved,
      });
    }

    const edgeKey = `${record.romId}\0${deviceKey}`;
    const edge = edgeMap.get(edgeKey) ?? {
      romId: record.romId,
      vendor,
      codename: resolved,
      active: false,
      maintainer: null,
      sourceUrl: null,
      source: record.source,
    };
    // A ROM is active if any of its snapshots says so.
    edge.active ||= record.active;
    edge.maintainer ??= record.maintainer;
    edge.sourceUrl ??= record.sourceUrl;
    edgeMap.set(edgeKey, edge);

    for (const version of record.versions) {
      versionMap.set(
        `${edgeKey}\0${version.romVersion ?? ""}\0${version.androidBase ?? ""}`,
        {
          romId: record.romId,
          vendor,
          codename: resolved,
          romVersion: version.romVersion,
          androidBase: version.androidBase,
        },
      );
    }
  }

  const edges = [...edgeMap.values()];
  const versions = [...versionMap.values()];
  const aliasRows = [...aliasMap.values()];

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
