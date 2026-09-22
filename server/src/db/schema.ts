import { sqliteTable, text, primaryKey, index } from "drizzle-orm/sqlite-core";

export const roms = sqliteTable("roms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const devices = sqliteTable(
  "devices",
  {
    vendor: text("vendor").notNull(),
    codename: text("codename").notNull(),
    name: text("name"),
  },
  (table) => [primaryKey({ columns: [table.vendor, table.codename] })],
);

export const romDevices = sqliteTable(
  "rom_devices",
  {
    romId: text("rom_id").notNull(),
    vendor: text("vendor").notNull(),
    codename: text("codename").notNull(),
    referenceUrl: text("reference_url"),
  },
  (table) => [
    primaryKey({ columns: [table.romId, table.vendor, table.codename] }),
    index("rom_devices_device_idx").on(table.vendor, table.codename),
  ],
);

// Alternate codenames that resolve to a canonical `(vendor, codename)` device.
// Kept as a table (not just a build-time artifact) so the API can resolve alias
// URLs and search them.
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
export const tables = [roms, devices, romDevices, aliases, meta] as const;
