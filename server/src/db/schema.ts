import { sqliteTable, text, integer, primaryKey, index } from "drizzle-orm/sqlite-core";

export const roms = sqliteTable("roms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const devices = sqliteTable("devices", {
  codename: text("codename").primaryKey(),
  name: text("name"),
  brand: text("brand"),
});

export const romDevices = sqliteTable(
  "rom_devices",
  {
    romId: text("rom_id").notNull(),
    codename: text("codename").notNull(),
    romVersion: text("rom_version"),
    androidBase: text("android_base"),
    active: integer("active", { mode: "boolean" }).notNull(),
    maintainer: text("maintainer"),
    sourceUrl: text("source_url"),
    source: text("source").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.romId, table.codename] }),
    index("rom_devices_codename_idx").on(table.codename),
  ]
);

export const aliases = sqliteTable("aliases", {
  alias: text("alias").primaryKey(),
  codename: text("codename").notNull(),
});

export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// This file is the single source of truth for the schema. The DB is a
// disposable, rebuildable artifact, so its DDL is generated from these table
// definitions in `ddl.ts` rather than maintained here by hand or tracked with
// migrations. New tables must be added to `tables` below.
export const tables = [roms, devices, romDevices, aliases, meta] as const;
