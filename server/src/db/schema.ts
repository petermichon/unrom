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

// The DB is a disposable, rebuildable artifact, so it is created from this DDL
// rather than migrations. Keep in sync with the drizzle table definitions above.
export const ddl = [
  `CREATE TABLE IF NOT EXISTS roms (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS devices (
     codename TEXT PRIMARY KEY,
     name TEXT,
     brand TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS rom_devices (
     rom_id TEXT NOT NULL,
     codename TEXT NOT NULL,
     rom_version TEXT,
     android_base TEXT,
     active INTEGER NOT NULL,
     maintainer TEXT,
     source_url TEXT,
     source TEXT NOT NULL,
     PRIMARY KEY (rom_id, codename)
   )`,
  `CREATE INDEX IF NOT EXISTS rom_devices_codename_idx ON rom_devices (codename)`,
  `CREATE TABLE IF NOT EXISTS aliases (
     alias TEXT PRIMARY KEY,
     codename TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS meta (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL
   )`,
];
