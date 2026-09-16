import Database from "better-sqlite3";
import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type {
  BrowseDevice,
  DeviceDetail,
  Mapping,
  Meta,
  RomChip,
  RomDetail,
  RomSupport,
} from "@unrom/contract";

import {
  devices,
  meta,
  romDeviceVersions,
  romDevices,
  roms,
} from "../db/schema.ts";

// Order by the first letter/digit so leading punctuation (e.g. "/e/OS") does not
// push a name to the top. Display names are left untouched.
const sortKey = (value: string): string =>
  value.replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();

const bySortKey = (a: string, b: string) => sortKey(a).localeCompare(sortKey(b));
const byBase = (a: string, b: string) => Number(a) - Number(b);

type Edge = typeof romDevices.$inferSelect;
type DeviceRow = typeof devices.$inferSelect;
type RomRow = typeof roms.$inferSelect;

interface Versions {
  androidBases: string[];
  romVersions: string[];
}

const deviceKey = (vendor: string, codename: string) => `${vendor}\0${codename}`;
const edgeKey = (romId: string, vendor: string, codename: string) =>
  `${romId}\0${vendor}\0${codename}`;

export function createApi(dbPath: string) {
  const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
  const db = drizzle(sqlite);

  function romNames(): Map<string, string> {
    return new Map(
      db
        .select()
        .from(roms)
        .all()
        .map((rom) => [rom.id, rom.name]),
    );
  }

  /** Group the (ROM version, Android base) rows by edge. */
  function versionsByEdge(): Map<string, Versions> {
    const grouped = new Map<
      string,
      { androidBases: Set<string>; romVersions: Set<string> }
    >();

    for (const row of db.select().from(romDeviceVersions).all()) {
      const key = edgeKey(row.romId, row.vendor, row.codename);
      let entry = grouped.get(key);
      if (!entry) {
        entry = { androidBases: new Set(), romVersions: new Set() };
        grouped.set(key, entry);
      }
      if (row.androidBase) entry.androidBases.add(row.androidBase);
      if (row.romVersion) entry.romVersions.add(row.romVersion);
    }

    const result = new Map<string, Versions>();
    for (const [key, entry] of grouped) {
      result.set(key, {
        androidBases: [...entry.androidBases].sort(byBase),
        romVersions: [...entry.romVersions].sort(),
      });
    }
    return result;
  }

  function toRomSupport(
    edge: Edge,
    names: Map<string, string>,
    versions: Map<string, Versions>,
  ): RomSupport {
    const edgeVersions = versions.get(
      edgeKey(edge.romId, edge.vendor, edge.codename),
    );
    return {
      id: edge.romId,
      name: names.get(edge.romId) ?? edge.romId,
      active: edge.active,
      androidBases: edgeVersions?.androidBases ?? [],
      romVersions: edgeVersions?.romVersions ?? [],
      maintainer: edge.maintainer,
      sourceUrl: edge.sourceUrl,
    };
  }

  function listDevices(query?: string): BrowseDevice[] {
    const names = romNames();

    const chipsByDevice = new Map<string, RomChip[]>();
    for (const edge of db.select().from(romDevices).all()) {
      const key = deviceKey(edge.vendor, edge.codename);
      let chips = chipsByDevice.get(key);
      if (!chips) {
        chips = [];
        chipsByDevice.set(key, chips);
      }
      if (!chips.some((chip) => chip.id === edge.romId)) {
        chips.push({ id: edge.romId, name: names.get(edge.romId) ?? edge.romId });
      }
    }

    const needle = query?.trim();
    const rows = needle
      ? db
          .select()
          .from(devices)
          .where(
            or(
              like(devices.codename, `%${needle}%`),
              like(sql`coalesce(${devices.name}, '')`, `%${needle}%`),
              like(sql`coalesce(${devices.brand}, '')`, `%${needle}%`),
              like(sql`coalesce(${devices.vendor}, '')`, `%${needle}%`),
            ),
          )
          .orderBy(asc(devices.codename))
          .all()
      : db.select().from(devices).orderBy(asc(devices.codename)).all();

    return rows.map((device) => ({
      vendor: device.vendor,
      codename: device.codename,
      name: device.name,
      brand: device.brand,
      roms: (chipsByDevice.get(deviceKey(device.vendor, device.codename)) ?? [])
        .sort((a, b) => bySortKey(a.name, b.name)),
    }));
  }

  function getDevice(codename: string, vendor?: string): DeviceDetail | null {
    const device = db
      .select()
      .from(devices)
      .where(
        and(
          eq(sql`lower(${devices.codename})`, codename.toLowerCase()),
          vendor ? eq(sql`lower(${devices.vendor})`, vendor.toLowerCase()) : undefined,
        ),
      )
      .get();
    if (!device) return null;

    const names = romNames();
    const versions = versionsByEdge();
    const roms = db
      .select()
      .from(romDevices)
      .where(
        and(
          eq(romDevices.vendor, device.vendor),
          eq(romDevices.codename, device.codename),
        ),
      )
      .all()
      .map((edge) => toRomSupport(edge, names, versions))
      .sort((a, b) => bySortKey(a.name, b.name));

    return {
      vendor: device.vendor,
      codename: device.codename,
      name: device.name,
      brand: device.brand,
      roms,
    };
  }

  function buildRom(
    rom: RomRow,
    edges: Edge[],
    deviceByKey: Map<string, DeviceRow>,
    romCountByDevice: Map<string, number>,
    versions: Map<string, Versions>,
  ): RomDetail {
    const androidBases = new Set<string>();
    const romVersions = new Set<string>();
    for (const edge of edges) {
      const edgeVersions = versions.get(
        edgeKey(edge.romId, edge.vendor, edge.codename),
      );
      for (const base of edgeVersions?.androidBases ?? []) {
        androidBases.add(base);
      }
      for (const version of edgeVersions?.romVersions ?? []) {
        romVersions.add(version);
      }
    }

    return {
      id: rom.id,
      name: rom.name,
      active: edges.some((edge) => edge.active),
      deviceCount: edges.length,
      androidBases: [...androidBases].sort(byBase),
      romVersions: [...romVersions].sort(),
      devices: edges
        .map((edge) => {
          const key = deviceKey(edge.vendor, edge.codename);
          const device = deviceByKey.get(key);
          return {
            vendor: edge.vendor,
            codename: edge.codename,
            name: device?.name ?? null,
            brand: device?.brand ?? null,
            romCount: romCountByDevice.get(key) ?? 0,
          };
        })
        .sort((a, b) =>
          sortKey(a.name ?? a.codename).localeCompare(
            sortKey(b.name ?? b.codename),
          ),
        ),
    };
  }

  function indexes(): {
    deviceByKey: Map<string, DeviceRow>;
    romCountByDevice: Map<string, number>;
    edgesByRom: Map<string, Edge[]>;
    versions: Map<string, Versions>;
  } {
    const deviceRows = db.select().from(devices).all();
    const edges = db.select().from(romDevices).all();

    const deviceByKey = new Map(
      deviceRows.map((d) => [deviceKey(d.vendor, d.codename), d]),
    );
    const romCountByDevice = new Map<string, number>();
    const edgesByRom = new Map<string, Edge[]>();

    for (const edge of edges) {
      const key = deviceKey(edge.vendor, edge.codename);
      romCountByDevice.set(key, (romCountByDevice.get(key) ?? 0) + 1);
      const list = edgesByRom.get(edge.romId);
      if (list) list.push(edge);
      else edgesByRom.set(edge.romId, [edge]);
    }

    return {
      deviceByKey,
      romCountByDevice,
      edgesByRom,
      versions: versionsByEdge(),
    };
  }

  function listRoms(): RomDetail[] {
    const { deviceByKey, romCountByDevice, edgesByRom, versions } = indexes();
    return db
      .select()
      .from(roms)
      .all()
      .map((rom) =>
        buildRom(
          rom,
          edgesByRom.get(rom.id) ?? [],
          deviceByKey,
          romCountByDevice,
          versions,
        ),
      )
      .sort((a, b) => bySortKey(a.name, b.name));
  }

  function getRom(id: string): RomDetail | null {
    const rom = db
      .select()
      .from(roms)
      .where(sql`lower(${roms.id}) = ${id.toLowerCase()}`)
      .get();
    if (!rom) return null;

    const { deviceByKey, romCountByDevice, versions } = indexes();
    const edges = db
      .select()
      .from(romDevices)
      .where(eq(romDevices.romId, rom.id))
      .all();

    return buildRom(rom, edges, deviceByKey, romCountByDevice, versions);
  }

  function listMappings(): Mapping[] {
    const names = romNames();
    const versions = versionsByEdge();
    const deviceByKey = new Map(
      db
        .select()
        .from(devices)
        .all()
        .map((device) => [deviceKey(device.vendor, device.codename), device]),
    );

    return db
      .select()
      .from(romDevices)
      .orderBy(
        asc(romDevices.vendor),
        asc(romDevices.codename),
        asc(romDevices.romId),
      )
      .all()
      .map((edge) => {
        const device = deviceByKey.get(deviceKey(edge.vendor, edge.codename));
        const edgeVersions = versions.get(
          edgeKey(edge.romId, edge.vendor, edge.codename),
        );
        return {
          vendor: edge.vendor,
          codename: edge.codename,
          deviceName: device?.name ?? null,
          brand: device?.brand ?? null,
          romId: edge.romId,
          romName: names.get(edge.romId) ?? edge.romId,
          active: edge.active,
          androidBases: edgeVersions?.androidBases ?? [],
          romVersions: edgeVersions?.romVersions ?? [],
          maintainer: edge.maintainer,
          sourceUrl: edge.sourceUrl,
        };
      });
  }

  function getMeta(): Meta {
    const values = Object.fromEntries(
      db
        .select()
        .from(meta)
        .all()
        .map((row) => [row.key, row.value]),
    );

    return {
      generatedAt: values.generatedAt ?? "",
      deviceCount: Number(values.deviceCount ?? 0),
      romCount: Number(values.romCount ?? 0),
      edgeCount: Number(values.edgeCount ?? 0),
    };
  }

  return {
    listDevices,
    getDevice,
    listRoms,
    getRom,
    listMappings,
    getMeta,
    close: () => sqlite.close(),
  };
}
