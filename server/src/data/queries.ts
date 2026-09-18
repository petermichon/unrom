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

import { devices, meta, romDevices, roms } from "../db/schema.ts";
import { vendorName } from "./identity.ts";

// Order by the first letter/digit so leading punctuation (e.g. "/e/OS") does not
// push a name to the top. Display names are left untouched.
const sortKey = (value: string): string =>
  value.replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();

const bySortKey = (a: string, b: string) => sortKey(a).localeCompare(sortKey(b));

type Edge = typeof romDevices.$inferSelect;
type DeviceRow = typeof devices.$inferSelect;
type RomRow = typeof roms.$inferSelect;

const deviceKey = (vendor: string, codename: string) => `${vendor}\0${codename}`;

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

  function toRomSupport(edge: Edge, names: Map<string, string>): RomSupport {
    return {
      id: edge.romId,
      name: names.get(edge.romId) ?? edge.romId,
      sourceUrl: edge.sourceUrl,
    };
  }

  function listDevices(query?: string, vendor?: string): BrowseDevice[] {
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
        chips.push({
          id: edge.romId,
          name: names.get(edge.romId) ?? edge.romId,
        });
      }
    }

    const filters = [];
    if (vendor) {
      filters.push(eq(sql`lower(${devices.vendor})`, vendor.toLowerCase()));
    }
    const needle = query?.trim();
    if (needle) {
      filters.push(
        or(
          like(devices.codename, `%${needle}%`),
          like(sql`coalesce(${devices.name}, '')`, `%${needle}%`),
          like(sql`coalesce(${devices.vendor}, '')`, `%${needle}%`),
        ),
      );
    }

    const rows = filters.length
      ? db
          .select()
          .from(devices)
          .where(and(...filters))
          .orderBy(asc(devices.vendor), asc(devices.codename))
          .all()
      : db.select().from(devices).orderBy(asc(devices.codename)).all();

    return rows.map((device) => ({
      vendor: device.vendor,
      vendorName: vendorName(device.vendor),
      codename: device.codename,
      name: device.name,
      roms: (
        chipsByDevice.get(deviceKey(device.vendor, device.codename)) ?? []
      ).sort((a, b) => bySortKey(a.name, b.name)),
    }));
  }

  function getDevice(vendor: string, codename: string): DeviceDetail | null {
    const device = db
      .select()
      .from(devices)
      .where(
        and(
          eq(sql`lower(${devices.vendor})`, vendor.toLowerCase()),
          eq(sql`lower(${devices.codename})`, codename.toLowerCase()),
        ),
      )
      .get();
    if (!device) return null;

    const names = romNames();
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
      .map((edge) => toRomSupport(edge, names))
      .sort((a, b) => bySortKey(a.name, b.name));

    return {
      vendor: device.vendor,
      vendorName: vendorName(device.vendor),
      codename: device.codename,
      name: device.name,
      roms,
    };
  }

  function buildRom(
    rom: RomRow,
    edges: Edge[],
    deviceByKey: Map<string, DeviceRow>,
    romCountByDevice: Map<string, number>,
  ): RomDetail {
    return {
      id: rom.id,
      name: rom.name,
      deviceCount: edges.length,
      devices: edges
        .map((edge) => {
          const key = deviceKey(edge.vendor, edge.codename);
          const device = deviceByKey.get(key);
          return {
            vendor: edge.vendor,
            codename: edge.codename,
            name: device?.name ?? null,
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

    return { deviceByKey, romCountByDevice, edgesByRom };
  }

  function listRoms(): RomDetail[] {
    const { deviceByKey, romCountByDevice, edgesByRom } = indexes();
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

    const { deviceByKey, romCountByDevice } = indexes();
    const edges = db
      .select()
      .from(romDevices)
      .where(eq(romDevices.romId, rom.id))
      .all();

    return buildRom(rom, edges, deviceByKey, romCountByDevice);
  }

  function listMappings(): Mapping[] {
    const names = romNames();
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
        return {
          vendor: edge.vendor,
          vendorName: vendorName(edge.vendor),
          codename: edge.codename,
          deviceName: device?.name ?? null,
          romId: edge.romId,
          romName: names.get(edge.romId) ?? edge.romId,
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
      contentHash: values.contentHash ?? "",
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
