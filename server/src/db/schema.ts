import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";

export const roms = sqliteTable("roms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  // "active" | "discontinued" | "unknown"; see `data/roms.ts`.
  status: text("status").notNull(),
});

export const devices = sqliteTable(
  "devices",
  {
    vendor: text("vendor").notNull(),
    codename: text("codename").notNull(),
    // Compact display name (first canonical name).
    name: text("name"),
    // JSON array of every canonical model name for this codename.
    names: text("names"),
    // 1 when a build targets this codename or a variant main it inherits
    // from. Derived at build time; see buildDatabase().
    covered: integer("covered").notNull().default(0),
    // Number of ROMs that support this device, counting builds inherited from
    // a covered variant. Derived at build time; ranks search results.
    romCount: integer("rom_count").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.vendor, table.codename] }),
    index("devices_covered_idx").on(table.covered),
    index("devices_rom_count_idx").on(table.romCount),
  ],
);

export const romDevices = sqliteTable(
  "rom_devices",
  {
    romId: text("rom_id").notNull(),
    vendor: text("vendor").notNull(),
    codename: text("codename").notNull(),
    referenceUrl: text("reference_url"),
    // "observed" | "derived"; see `sources/adapter.ts`.
    referenceKind: text("reference_kind").notNull().default("observed"),
    reportedCodename: text("reported_codename"),
  },
  (table) => [
    primaryKey({ columns: [table.romId, table.vendor, table.codename] }),
    index("rom_devices_device_idx").on(table.vendor, table.codename),
  ],
);

// Device-level coverage: a build target (`codename`) also covers a hardware
// variant (`variantCodename`). `source` is `verified` (checked in the build
// tree) or `declared` (a source grouped the codenames). Variant pages inherit
// the main's ROMs, so coverage is a fact about the build, not one roster.
export const deviceVariants = sqliteTable(
  "device_variants",
  {
    vendor: text("vendor").notNull(),
    codename: text("codename").notNull(),
    variantCodename: text("variant_codename").notNull(),
    source: text("source").notNull(),
    evidence: text("evidence").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.vendor, table.codename, table.variantCodename],
    }),
    index("device_variants_variant_idx").on(
      table.vendor,
      table.variantCodename,
    ),
  ],
);

// Curated `(vendor, codename)` → model name mappings, independent of whether a
// source currently reports the device.
export const registry = sqliteTable(
  "registry",
  {
    vendor: text("vendor").notNull(),
    codename: text("codename").notNull(),
    name: text("name"),
    names: text("names"),
    confidence: text("confidence").notNull(),
    sources: text("sources").notNull(),
  },
  (table) => [primaryKey({ columns: [table.vendor, table.codename] })],
);

// Alternate codenames that resolve to a canonical `(vendor, codename)` device.
// Kept as a table (not just a build-time artifact) so the API can resolve alias
// URLs and search them.
// Vendor-level bootloader-unlock policies. The source and verification date are
// part of the row because the policy is a curated claim, not a device property.
export const bootloaderPolicies = sqliteTable("bootloader_policies", {
  vendor: text("vendor").primaryKey(),
  vendorName: text("vendor_name").notNull(),
  status: text("status").notNull(),
  scope: text("scope").notNull(),
  summary: text("summary").notNull(),
  conditions: text("conditions").notNull(),
  sourceUrl: text("source_url").notNull(),
  verifiedAt: text("verified_at").notNull(),
});

export const aliases = sqliteTable(
  "aliases",
  {
    vendor: text("vendor").notNull(),
    alias: text("alias").notNull(),
    codename: text("codename").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.vendor, table.alias] }),
    index("aliases_device_idx").on(table.vendor, table.codename),
  ],
);

export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// This file is the single source of truth for the schema. The DB is a
// disposable, rebuildable artifact, so its DDL is generated from these table
// definitions in `ddl.ts` rather than maintained here by hand or tracked with
// migrations. New tables must be added to `tables` below.
export const tables = [
  roms,
  devices,
  registry,
  bootloaderPolicies,
  romDevices,
  aliases,
  deviceVariants,
  meta,
] as const;
