import Database from "better-sqlite3";
import { asc, eq, like, or, sql } from "drizzle-orm";
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

import { devices, meta, romDevices, roms } from "../db/schema.ts";

type Edge = typeof romDevices.$inferSelect;
type DeviceRow = typeof devices.$inferSelect;
type RomRow = typeof roms.$inferSelect;

export function createApi(dbPath: string) {
  const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
  const db = drizzle(sqlite);

  function romNames(): Map<string, string> {
    return new Map(
      db
        .select()
        .from(roms)
        .all()
        .map((rom) => [rom.id, rom.name])
    );
  }

  function toRomSupport(edge: Edge, names: Map<string, string>): RomSupport {
    return {
      id: edge.romId,
      name: names.get(edge.romId) ?? edge.romId,
      active: edge.active,
      androidBases: edge.androidBase ? [edge.androidBase] : [],
      romVersion: edge.romVersion,
      maintainer: edge.maintainer,
      sourceUrl: edge.sourceUrl,
    };
  }

  function listDevices(query?: string): BrowseDevice[] {
    const names = romNames();

    const chipsByDevice = new Map<string, RomChip[]>();
    for (const edge of db.select().from(romDevices).all()) {
      let chips = chipsByDevice.get(edge.codename);
      if (!chips) {
        chips = [];
        chipsByDevice.set(edge.codename, chips);
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
              like(sql`coalesce(${devices.brand}, '')`, `%${needle}%`)
            )
          )
          .orderBy(asc(devices.codename))
          .all()
      : db.select().from(devices).orderBy(asc(devices.codename)).all();

    return rows.map((device) => ({
      codename: device.codename,
      name: device.name,
      brand: device.brand,
      roms: (chipsByDevice.get(device.codename) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }));
  }

  function getDevice(codename: string): DeviceDetail | null {
    const device = db
      .select()
      .from(devices)
      .where(sql`lower(${devices.codename}) = ${codename.toLowerCase()}`)
      .get();
    if (!device) return null;

    const names = romNames();
    const roms = db
      .select()
      .from(romDevices)
      .where(eq(romDevices.codename, codename))
      .all()
      .map((edge) => toRomSupport(edge, names))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      codename: device.codename,
      name: device.name,
      brand: device.brand,
      roms,
    };
  }

  function buildRom(
    rom: RomRow,
    edges: Edge[],
    deviceByCodename: Map<string, DeviceRow>,
    romCountByDevice: Map<string, number>
  ): RomDetail {
    const androidBases = new Set<string>();
    const romVersions = new Set<string>();
    for (const edge of edges) {
      if (edge.androidBase) androidBases.add(edge.androidBase);
      if (edge.romVersion) romVersions.add(edge.romVersion);
    }

    return {
      id: rom.id,
      name: rom.name,
      active: edges.some((edge) => edge.active),
      deviceCount: edges.length,
      androidBases: [...androidBases].sort(),
      romVersions: [...romVersions].sort(),
      devices: edges
        .map((edge) => {
          const device = deviceByCodename.get(edge.codename);
          return {
            codename: edge.codename,
            name: device?.name ?? null,
            brand: device?.brand ?? null,
            romCount: romCountByDevice.get(edge.codename) ?? 0,
          };
        })
        .sort((a, b) =>
          (a.name ?? a.codename).localeCompare(b.name ?? b.codename)
        ),
    };
  }

  function indexes(): {
    deviceByCodename: Map<string, DeviceRow>;
    romCountByDevice: Map<string, number>;
    edgesByRom: Map<string, Edge[]>;
  } {
    const deviceRows = db.select().from(devices).all();
    const edges = db.select().from(romDevices).all();

    const deviceByCodename = new Map(deviceRows.map((d) => [d.codename, d]));
    const romCountByDevice = new Map<string, number>();
    const edgesByRom = new Map<string, Edge[]>();

    for (const edge of edges) {
      romCountByDevice.set(
        edge.codename,
        (romCountByDevice.get(edge.codename) ?? 0) + 1
      );
      const list = edgesByRom.get(edge.romId);
      if (list) list.push(edge);
      else edgesByRom.set(edge.romId, [edge]);
    }

    return { deviceByCodename, romCountByDevice, edgesByRom };
  }

  function listRoms(): RomDetail[] {
    const { deviceByCodename, romCountByDevice, edgesByRom } = indexes();
    return db
      .select()
      .from(roms)
      .orderBy(asc(roms.name))
      .all()
      .map((rom) =>
        buildRom(
          rom,
          edgesByRom.get(rom.id) ?? [],
          deviceByCodename,
          romCountByDevice
        )
      );
  }

  function getRom(id: string): RomDetail | null {
    const rom = db
      .select()
      .from(roms)
      .where(sql`lower(${roms.id}) = ${id.toLowerCase()}`)
      .get();
    if (!rom) return null;

    const { deviceByCodename, romCountByDevice } = indexes();
    const edges = db
      .select()
      .from(romDevices)
      .where(eq(romDevices.romId, id))
      .all();

    return buildRom(rom, edges, deviceByCodename, romCountByDevice);
  }

  function listMappings(): Mapping[] {
    const names = romNames();
    const deviceByCodename = new Map(
      db
        .select()
        .from(devices)
        .all()
        .map((device) => [device.codename, device])
    );

    return db
      .select()
      .from(romDevices)
      .orderBy(asc(romDevices.codename), asc(romDevices.romId))
      .all()
      .map((edge) => {
        const device = deviceByCodename.get(edge.codename);
        return {
          codename: edge.codename,
          deviceName: device?.name ?? null,
          brand: device?.brand ?? null,
          romId: edge.romId,
          romName: names.get(edge.romId) ?? edge.romId,
          active: edge.active,
          androidBases: edge.androidBase ? [edge.androidBase] : [],
          romVersion: edge.romVersion,
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
        .map((row) => [row.key, row.value])
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
