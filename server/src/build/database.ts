import { rmSync } from "node:fs";
import { createHash } from "node:crypto";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  CANONICAL_CODENAMES,
  EXCLUDED_CODENAMES,
  UNKNOWN_VENDOR,
  VERIFIED_COVERAGE,
  canonicalCodename,
  expandCodename,
  vendorForBrand,
  vendorForCodename,
  vendorForName,
} from "../data/identity.ts";
import { generateDdl } from "../db/ddl.ts";
import {
  aliases,
  deviceVariants,
  devices,
  meta,
  romDevices,
  roms,
} from "../db/schema.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

export interface BuildResult {
  romCount: number;
  deviceCount: number;
  edgeCount: number;
  aliases: Alias[];
  generatedAt: string;
}

interface Device {
  vendor: string;
  codename: string;
  name: string | null;
}

interface Edge {
  romId: string;
  vendor: string;
  codename: string;
  referenceUrl: string | null;
  // The main codename whose build covers this device, when the source grouped
  // it with a variant (e.g. a `sweetin` edge reported under `sweet`).
  reportedCodename: string | null;
}

interface Alias {
  vendor: string;
  alias: string;
  codename: string;
}

interface Coverage {
  vendor: string;
  codename: string;
  variantCodename: string;
  source: "declared" | "verified";
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

// A stable digest of the dataset, independent of row insertion order and build
// time. Consumers can use it to detect a content change without diffing.
function contentHash(
  romMap: Map<string, string>,
  deviceMap: Map<string, Device>,
  edges: Edge[],
  coverage: Coverage[],
): string {
  const hash = createHash("sha256");
  const key = (vendor: string, codename: string) => `${vendor}\0${codename}`;

  for (const [id, name] of [...romMap].sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(`r\0${id}\0${name}\n`);
  }
  for (const device of [...deviceMap.values()].sort((a, b) =>
    key(a.vendor, a.codename).localeCompare(key(b.vendor, b.codename)),
  )) {
    hash.update(`d\0${device.vendor}\0${device.codename}\0${device.name ?? ""}\n`);
  }
  for (const edge of [...edges].sort((a, b) =>
    `${a.romId}\0${key(a.vendor, a.codename)}`.localeCompare(
      `${b.romId}\0${key(b.vendor, b.codename)}`,
    ),
  )) {
    hash.update(
      `e\0${edge.romId}\0${edge.vendor}\0${edge.codename}\0${edge.referenceUrl ?? ""}\0${edge.reportedCodename ?? ""}\n`,
    );
  }
  for (const row of [...coverage].sort((a, b) =>
    key(a.vendor, `${a.codename}\0${a.variantCodename}`).localeCompare(
      key(b.vendor, `${b.codename}\0${b.variantCodename}`),
    ),
  )) {
    hash.update(
      `v\0${row.vendor}\0${row.codename}\0${row.variantCodename}\0${row.source}\n`,
    );
  }

  return hash.digest("hex").slice(0, 16);
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
      // Emulator images and unified build targets are not devices.
      if (EXCLUDED_CODENAMES.has(part.trim().toLowerCase())) continue;
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
  const aliasMap = new Map<string, Alias>();
  const coverageMap = new Map<string, Coverage>();

  const ensureDevice = (vendor: string, codename: string): void => {
    const key = `${vendor}\0${codename}`;
    if (!deviceMap.has(key)) {
      deviceMap.set(key, { vendor, codename, name: null });
    }
  };

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
    };
    device.name ??= record.name;
    deviceMap.set(deviceKey, device);

    // Only record aliases that differ beyond casing: lookups are
    // case-insensitive, so a casing variant is not a distinct codename.
    if (part.toLowerCase() !== resolved.toLowerCase()) {
      aliasMap.set(`${vendor}\0${part}`, {
        vendor,
        alias: part,
        codename: resolved,
      });
    }

    const key = `${record.romId}\0${deviceKey}`;
    const edge = edgeMap.get(key) ?? {
      romId: record.romId,
      vendor,
      codename: resolved,
      referenceUrl: null,
      reportedCodename: null,
    };
    edge.referenceUrl ??= record.referenceUrl;
    // A covering entry (a variant reported under a different main codename)
    // records that main. A rename resolves to the same device, so it does not.
    if (record.reportedCodename) {
      const main = canonicalCodename(
        vendor,
        canonicalCasing(record.reportedCodename),
      );
      if (main !== resolved) {
        edge.reportedCodename ??= main;
        coverageMap.set(`${vendor}\0${main}\0${resolved}`, {
          vendor,
          codename: main,
          variantCodename: resolved,
          source: "declared",
        });
      }
    }
    edgeMap.set(key, edge);
  }

  // Verified coverage is authoritative and does not depend on a roster
  // mentioning the variant; make sure both codenames are real devices.
  for (const [key, variants] of Object.entries(VERIFIED_COVERAGE)) {
    const [vendor, main] = key.split("\0");
    for (const variant of variants) {
      ensureDevice(vendor, main);
      ensureDevice(vendor, variant);
      coverageMap.set(`${vendor}\0${main}\0${variant}`, {
        vendor,
        codename: main,
        variantCodename: variant,
        source: "verified",
      });
    }
  }

  const edges = [...edgeMap.values()];
  const aliasRows = [...aliasMap.values()];
  const coverageRows = [...coverageMap.values()];

  // SOURCE_DATE_EPOCH makes rebuilds deterministic (reproducible builds).
  const generatedAt = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
    : new Date().toISOString();
  const metaRows: Array<[string, string]> = [
    ["generatedAt", generatedAt],
    ["contentHash", contentHash(romMap, deviceMap, edges, coverageRows)],
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
    for (const alias of aliasRows) {
      tx.insert(aliases).values(alias).run();
    }
    for (const coverage of coverageRows) {
      tx.insert(deviceVariants).values(coverage).run();
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
    aliases: aliasRows,
    generatedAt,
  };
}
