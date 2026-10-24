import { rmSync } from "node:fs";
import { createHash } from "node:crypto";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import {
  CANONICAL_CODENAMES,
  EXCLUDED_CODENAMES,
  DECLARED_GROUPS,
  UNKNOWN_VENDOR,
  VERIFIED_GROUPS,
  canonicalCodename,
  expandCodename,
  isValidCodename,
  vendorForBrand,
  vendorForCodename,
  vendorForName,
  vendorName,
} from "../data/identity.ts";
import { DEVICE_NAMES, deviceNames } from "../data/registry.ts";
import { generateDdl } from "../db/ddl.ts";
import {
  aliases,
  deviceVariants,
  devices,
  meta,
  registry,
  romDevices,
  roms,
} from "../db/schema.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

export interface BuildResult {
  romCount: number;
  deviceCount: number;
  edgeCount: number;
  registryCount: number;
  registryReport: RegistryReport;
  aliases: Alias[];
  generatedAt: string;
}

export interface RegistryNameSource {
  name: string;
  romIds: string[];
}

export interface RegistryCandidate {
  vendor: string;
  vendorName: string;
  codename: string;
  /** The name the dataset currently falls back to, if any. */
  name: string | null;
  /** Distinct names reported by sources, most-cited first. */
  sources: RegistryNameSource[];
  conflict: boolean;
  /** A name that is unlikely to be a usable model name. */
  suspicious: boolean;
  issues: string[];
}

export interface RegistryCoverage {
  vendor: string;
  vendorName: string;
  curated: number;
  sourceNamed: number;
  unnamed: number;
}

export interface RegistryReport {
  summary: {
    devices: number;
    registryEntries: number;
    curated: number;
    sourceNamed: number;
    unnamed: number;
    conflicts: number;
    suspicious: number;
  };
  candidates: RegistryCandidate[];
  conflicts: RegistryCandidate[];
  coverage: RegistryCoverage[];
}

interface Device {
  vendor: string;
  codename: string;
  name: string | null;
  names: string[] | null;
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

interface RegistryRow {
  vendor: string;
  codename: string;
  name: string;
  names: string;
}

interface Coverage {
  vendor: string;
  codename: string;
  variantCodename: string;
  source: "declared" | "verified";
  evidence: string;
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
  registryRows: RegistryRow[],
): string {
  const hash = createHash("sha256");
  const key = (vendor: string, codename: string) => `${vendor}\0${codename}`;

  for (const [id, name] of [...romMap].sort(([a], [b]) => a.localeCompare(b))) {
    hash.update(`r\0${id}\0${name}\n`);
  }
  for (const device of [...deviceMap.values()].sort((a, b) =>
    key(a.vendor, a.codename).localeCompare(key(b.vendor, b.codename)),
  )) {
    hash.update(
      `d\0${device.vendor}\0${device.codename}\0${device.name ?? ""}\0${(device.names ?? []).join("|")}\n`,
    );
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
  for (const row of [...registryRows].sort((a, b) =>
    key(a.vendor, a.codename).localeCompare(key(b.vendor, b.codename)),
  )) {
    hash.update(
      `n\0${row.vendor}\0${row.codename}\0${row.name}\0${row.names}\n`,
    );
  }
  for (const row of [...coverage].sort((a, b) =>
    key(a.vendor, `${a.codename}\0${a.variantCodename}`).localeCompare(
      key(b.vendor, `${b.codename}\0${b.variantCodename}`),
    ),
  )) {
    hash.update(
      `v\0${row.vendor}\0${row.codename}\0${row.variantCodename}\0${row.source}\0${row.evidence}\n`,
    );
  }

  return hash.digest("hex").slice(0, 16);
}

// Source names per device: key → exact name → ROM ids that reported it.
type SourceNames = Map<string, Map<string, Set<string>>>;

// Names that pass a uniqueness check can still be useless (e.g. a source
// reporting a Fairphone's name as "2"). Flag them for human review instead of
// offering them as ready-to-paste.
function nameIssues(name: string, codename: string): string[] {
  const normalized = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();
  const issues: string[] = [];
  if (!/\p{L}/u.test(name)) issues.push("no model words");
  if (name.replace(/\s+/g, "").length <= 2) issues.push("too short");
  if (normalized(name) === normalized(codename)) {
    issues.push("same as codename");
  }
  return issues;
}

function buildRegistryReport(
  deviceMap: Map<string, Device>,
  sourceNames: SourceNames,
): RegistryReport {
  const normalized = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const candidates: RegistryCandidate[] = [];
  const coverage = new Map<string, RegistryCoverage>();

  for (const device of deviceMap.values()) {
    const key = `${device.vendor}\0${device.codename}`;
    const curated = deviceNames(device.vendor, device.codename) !== null;
    const names = sourceNames.get(key);

    const row = coverage.get(device.vendor) ?? {
      vendor: device.vendor,
      vendorName: vendorName(device.vendor),
      curated: 0,
      sourceNamed: 0,
      unnamed: 0,
    };
    if (curated) {
      row.curated++;
    } else if (names && names.size > 0) {
      row.sourceNamed++;
    } else {
      row.unnamed++;
    }
    coverage.set(device.vendor, row);

    if (curated) continue;

    const sources: RegistryNameSource[] = [...(names ?? [])]
      .map(([name, romIds]) => ({ name, romIds: [...romIds].sort() }))
      .sort(
        (a, b) =>
          b.romIds.length - a.romIds.length || a.name.localeCompare(b.name),
      );
    const distinct = new Set(sources.map((source) => normalized(source.name)));
    const name = names ? ([...names.keys()][0] ?? null) : null;

    candidates.push({
      vendor: device.vendor,
      vendorName: vendorName(device.vendor),
      codename: device.codename,
      name,
      sources,
      conflict: distinct.size > 1,
      suspicious: name !== null && nameIssues(name, device.codename).length > 0,
      issues: name === null ? [] : nameIssues(name, device.codename),
    });
  }

  candidates.sort(
    (a, b) =>
      a.vendorName.localeCompare(b.vendorName) ||
      a.vendor.localeCompare(b.vendor) ||
      a.codename.localeCompare(b.codename),
  );
  const conflicts = candidates.filter((candidate) => candidate.conflict);

  return {
    summary: {
      devices: deviceMap.size,
      registryEntries: Object.keys(DEVICE_NAMES).length,
      curated: [...coverage.values()].reduce((sum, row) => sum + row.curated, 0),
      sourceNamed: [...coverage.values()].reduce(
        (sum, row) => sum + row.sourceNamed,
        0,
      ),
      unnamed: [...coverage.values()].reduce(
        (sum, row) => sum + row.unnamed,
        0,
      ),
      conflicts: conflicts.length,
      suspicious: candidates.filter((candidate) => candidate.suspicious)
        .length,
    },
    candidates,
    conflicts,
    coverage: [...coverage.values()].sort(
      (a, b) =>
        a.vendorName.localeCompare(b.vendorName) ||
        a.vendor.localeCompare(b.vendor),
    ),
  };
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
      if (!isValidCodename(part)) continue;
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
  const sourceNames: SourceNames = new Map();

  const ensureDevice = (vendor: string, codename: string): void => {
    const key = `${vendor}\0${codename}`;
    if (deviceMap.has(key)) return;
    const curated = deviceNames(vendor, codename);
    deviceMap.set(key, {
      vendor,
      codename,
      name: curated?.[0] ?? null,
      names: curated ?? null,
    });
  };

  // Union-find over device keys to build compatibility groups: the sets of
  // codenames a single build is valid for. Verified groups come from the device
  // tree; a roster grouping (a combined codename) declares one.
  const groupParent = new Map<string, string>();
  const groupMembers = new Map<string, Set<string>>();
  const groupMeta = new Map<
    string,
    { source: "declared" | "verified"; evidence: string }
  >();

  const ensureGroup = (key: string): void => {
    if (groupParent.has(key)) return;
    groupParent.set(key, key);
    groupMembers.set(key, new Set([key]));
    groupMeta.set(key, { source: "declared", evidence: "" });
  };

  const groupRoot = (key: string): string => {
    let root = key;
    while (groupParent.get(root) !== root) root = groupParent.get(root)!;
    let current = key;
    while (groupParent.get(current) !== root) {
      const next = groupParent.get(current)!;
      groupParent.set(current, root);
      current = next;
    }
    return root;
  };

  const joinGroup = (
    a: string,
    b: string,
    meta: { source: "declared" | "verified"; evidence: string },
  ): void => {
    ensureGroup(a);
    ensureGroup(b);
    const rootA = groupRoot(a);
    const rootB = groupRoot(b);
    const existing = groupMeta.get(rootA)!;
    // A verified fact wins over a declared one; otherwise keep what we have.
    const merged =
      meta.source === "verified" || !existing.evidence ? meta : existing;
    if (rootA === rootB) {
      groupMeta.set(rootA, merged);
      return;
    }
    groupParent.set(rootB, rootA);
    const members = groupMembers.get(rootA)!;
    for (const member of groupMembers.get(rootB)!) members.add(member);
    groupMembers.delete(rootB);
    groupMeta.delete(rootB);
    groupMeta.set(rootA, merged);
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
      names: null,
    };
    // Names come only from the curated registry. Uncurated devices stay
    // unnamed (the UI shows the codename) until they are added.
    const curated = deviceNames(vendor, resolved);
    if (curated) {
      device.names = curated;
      device.name = curated[0] ?? null;
    }
    deviceMap.set(deviceKey, device);

    if (record.name) {
      const names = sourceNames.get(deviceKey) ?? new Map<string, Set<string>>();
      const romIds = names.get(record.name) ?? new Set<string>();
      romIds.add(record.romId);
      names.set(record.name, romIds);
      sourceNames.set(deviceKey, names);
    }

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
        joinGroup(`${vendor}\0${main}`, `${vendor}\0${resolved}`, {
          source: "declared",
          evidence: `${record.romId} roster`,
        });
      }
    }
    edgeMap.set(key, edge);
  }

  // Verified groups are authoritative: a build is valid for every member, even
  // when no roster names the variant. Make sure each member is a real device.
  for (const group of [...VERIFIED_GROUPS, ...DECLARED_GROUPS]) {
    const keys = group.members.map((member) => {
      ensureDevice(group.vendor, member);
      return `${group.vendor}\0${member}`;
    });
    for (const key of keys) {
      joinGroup(keys[0], key, {
        source: group.source,
        evidence: group.evidence,
      });
    }
  }

  // Materialize each group as symmetric coverage rows: every member is covered
  // by builds for every other member.
  const coverageRows: Coverage[] = [];
  for (const [root, members] of groupMembers) {
    if (members.size < 2) continue;
    const meta = groupMeta.get(root)!;
    const list = [...members];
    for (const member of list) {
      const [vendor, codename] = member.split("\0");
      for (const other of list) {
        if (other === member) continue;
        coverageRows.push({
          vendor,
          codename,
          variantCodename: other.split("\0")[1],
          source: meta.source,
          evidence: meta.evidence,
        });
      }
    }
  }

  const edges = [...edgeMap.values()];
  const aliasRows = [...aliasMap.values()];

  // The curated registry is independent of source coverage: every entry ships,
  // even when no roster currently names the device.
  const registryRows: RegistryRow[] = Object.entries(DEVICE_NAMES)
    .map(([key, names]) => {
      const [vendor, codename] = key.split("\0");
      return {
        vendor,
        codename,
        name: names[0] ?? codename,
        names: JSON.stringify(names),
      };
    })
    .sort((a, b) =>
      `${a.vendor}\0${a.codename}`.localeCompare(`${b.vendor}\0${b.codename}`),
    );

  const registryReport = buildRegistryReport(deviceMap, sourceNames);

  // SOURCE_DATE_EPOCH makes rebuilds deterministic (reproducible builds).
  const generatedAt = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
    : new Date().toISOString();
  const metaRows: Array<[string, string]> = [
    ["generatedAt", generatedAt],
    [
      "contentHash",
      contentHash(romMap, deviceMap, edges, coverageRows, registryRows),
    ],
  ];

  // One transaction: all-or-nothing, and far faster than per-row commits.
  db.transaction((tx) => {
    for (const [id, name] of romMap) {
      tx.insert(roms).values({ id, name }).run();
    }
    for (const device of deviceMap.values()) {
      tx.insert(devices)
        .values({
          vendor: device.vendor,
          codename: device.codename,
          name: device.name,
          names: device.names ? JSON.stringify(device.names) : null,
        })
        .run();
    }
    for (const row of registryRows) {
      tx.insert(registry).values(row).run();
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
    registryCount: registryRows.length,
    registryReport,
    aliases: aliasRows,
    generatedAt,
  };
}
