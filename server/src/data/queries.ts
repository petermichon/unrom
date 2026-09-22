import Database from "better-sqlite3";
import { and, asc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type {
  BrowseDevice,
  DeviceDetail,
  DeviceVariant,
  Mapping,
  Meta,
  RomChip,
  RomDetail,
  RomSupport,
} from "@unrom/contract";

import {
  aliases,
  deviceVariants,
  devices,
  meta,
  romDevices,
  roms,
} from "../db/schema.ts";
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

  // Alternate codenames grouped by the canonical device they resolve to.
  function aliasesByDevice(): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const row of db.select().from(aliases).all()) {
      const key = deviceKey(row.vendor, row.codename);
      const list = map.get(key);
      if (list) list.push(row.alias);
      else map.set(key, [row.alias]);
    }
    for (const list of map.values()) list.sort();
    return map;
  }

  // A canonical device row, looked up exactly.
  function findDevice(vendor: string, codename: string): DeviceRow | undefined {
    return db
      .select()
      .from(devices)
      .where(
        and(
          eq(sql`lower(${devices.vendor})`, vendor.toLowerCase()),
          eq(sql`lower(${devices.codename})`, codename.toLowerCase()),
        ),
      )
      .get();
  }

  function romNames(): Map<string, string> {
    return new Map(
      db
        .select()
        .from(roms)
        .all()
        .map((rom) => [rom.id, rom.name]),
    );
  }

  function toRomSupport(
    edge: Edge,
    names: Map<string, string>,
    inheritedFrom: string | null = null,
  ): RomSupport {
    return {
      id: edge.romId,
      name: names.get(edge.romId) ?? edge.romId,
      referenceUrl: edge.referenceUrl,
      inheritedFrom,
    };
  }

  // Device-level coverage: which build targets cover which variants.
  function deviceCoverage(): {
    variantsByMain: Map<string, string[]>;
    mainsByVariant: Map<string, string[]>;
  } {
    const variantsByMain = new Map<string, string[]>();
    const mainsByVariant = new Map<string, string[]>();
    const push = (map: Map<string, string[]>, key: string, value: string) => {
      const list = map.get(key);
      if (list) list.push(value);
      else map.set(key, [value]);
    };

    for (const row of db.select().from(deviceVariants).all()) {
      push(
        variantsByMain,
        deviceKey(row.vendor, row.codename),
        row.variantCodename,
      );
      push(
        mainsByVariant,
        deviceKey(row.vendor, row.variantCodename),
        deviceKey(row.vendor, row.codename),
      );
    }
    for (const list of variantsByMain.values()) list.sort();
    for (const list of mainsByVariant.values()) list.sort();
    return { variantsByMain, mainsByVariant };
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
      const pattern = `%${needle.toLowerCase()}%`;
      filters.push(
        or(
          like(devices.codename, `%${needle}%`),
          like(sql`coalesce(${devices.name}, '')`, `%${needle}%`),
          like(sql`coalesce(${devices.vendor}, '')`, `%${needle}%`),
          // Match a device by any of its alternate codenames.
          sql`exists (select 1 from aliases a where a.vendor = ${devices.vendor} and a.codename = ${devices.codename} and lower(a.alias) like ${pattern})`,
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

    const aliasMap = aliasesByDevice();
    const coverage = deviceCoverage();
    // A variant is supported by every ROM that builds its covering target, so
    // the list count matches the detail page.
    const chipsFor = (key: string): RomChip[] => {
      const chips = [...(chipsByDevice.get(key) ?? [])];
      for (const mainKey of coverage.mainsByVariant.get(key) ?? []) {
        for (const chip of chipsByDevice.get(mainKey) ?? []) {
          if (!chips.some((existing) => existing.id === chip.id)) {
            chips.push(chip);
          }
        }
      }
      return chips.sort((a, b) => bySortKey(a.name, b.name));
    };

    return rows.map((device) => {
      const key = deviceKey(device.vendor, device.codename);
      return {
        vendor: device.vendor,
        vendorName: vendorName(device.vendor),
        codename: device.codename,
        name: device.name,
        aliases: aliasMap.get(key) ?? [],
        roms: chipsFor(key),
      };
    });
  }

  // Resolve an incoming `(vendor, codename)` to its canonical device, following
  // one alias hop when the codename is an alternate.
  function resolveDevice(
    vendor: string,
    codename: string,
  ): { device: DeviceRow; aliases: string[] } | null {
    const aliasMap = aliasesByDevice();

    let device = findDevice(vendor, codename);
    if (!device) {
      const alias = db
        .select()
        .from(aliases)
        .where(
          and(
            eq(sql`lower(${aliases.vendor})`, vendor.toLowerCase()),
            eq(sql`lower(${aliases.alias})`, codename.toLowerCase()),
          ),
        )
        .get();
      if (alias) device = findDevice(alias.vendor, alias.codename);
    }
    if (!device) return null;

    const key = deviceKey(device.vendor, device.codename);
    return { device, aliases: aliasMap.get(key) ?? [] };
  }

  function getDevice(vendor: string, codename: string): DeviceDetail | null {
    const resolved = resolveDevice(vendor, codename);
    if (!resolved) return null;
    const { device, aliases: deviceAliases } = resolved;

    const names = romNames();
    const direct = db
      .select()
      .from(romDevices)
      .where(
        and(
          eq(romDevices.vendor, device.vendor),
          eq(romDevices.codename, device.codename),
        ),
      )
      .all();

    // A variant is covered by another codename's builds (e.g. `sweetin` by
    // `sweet`); it inherits that target's ROMs. Coverage is a fact about the
    // build, sourced in `device_variants`, not inferred from one roster.
    const coverage = deviceCoverage();
    const key = deviceKey(device.vendor, device.codename);
    const mains = coverage.mainsByVariant.get(key) ?? [];
    const seenRoms = new Set(direct.map((edge) => edge.romId));
    const inherited: Array<{ edge: Edge; from: string }> = [];
    for (const mainKey of mains) {
      const [mainVendor, mainCodename] = mainKey.split("\0");
      const mainEdges = db
        .select()
        .from(romDevices)
        .where(
          and(
            eq(romDevices.vendor, mainVendor),
            eq(romDevices.codename, mainCodename),
          ),
        )
        .all();
      for (const edge of mainEdges) {
        if (seenRoms.has(edge.romId)) continue;
        seenRoms.add(edge.romId);
        inherited.push({ edge, from: mainCodename });
      }
    }

    const roms = [
      ...direct.map((edge) => toRomSupport(edge, names)),
      ...inherited.map(({ edge, from }) => toRomSupport(edge, names, from)),
    ].sort((a, b) => bySortKey(a.name, b.name));

    return {
      vendor: device.vendor,
      vendorName: vendorName(device.vendor),
      codename: device.codename,
      name: device.name,
      aliases: deviceAliases,
      // Every codename a single build covers, including this one.
      group: [
        device.codename,
        ...(coverage.variantsByMain.get(key) ?? []),
      ].sort(),
      roms,
    };
  }

  function buildRom(
    rom: RomRow,
    edges: Edge[],
    deviceByKey: Map<string, DeviceRow>,
    romCountByDevice: Map<string, number>,
    variantsByMain: Map<string, string[]>,
  ): RomDetail {
    const devices: RomDetail["devices"] = [];
    const seen = new Set<string>();
    const add = (vendor: string, codename: string) => {
      const key = deviceKey(vendor, codename);
      if (seen.has(key)) return;
      seen.add(key);
      const device = deviceByKey.get(key);
      devices.push({
        vendor,
        codename,
        name: device?.name ?? null,
        romCount: romCountByDevice.get(key) ?? 0,
      });
    };

    // A build covers its target and every variant that target covers.
    for (const edge of edges) {
      add(edge.vendor, edge.codename);
      for (const variant of variantsByMain.get(
        deviceKey(edge.vendor, edge.codename),
      ) ?? []) {
        add(edge.vendor, variant);
      }
    }
    devices.sort((a, b) =>
      sortKey(a.name ?? a.codename).localeCompare(
        sortKey(b.name ?? b.codename),
      ),
    );

    return { id: rom.id, name: rom.name, deviceCount: devices.length, devices };
  }

  function indexes(): {
    deviceByKey: Map<string, DeviceRow>;
    romCountByDevice: Map<string, number>;
    edgesByRom: Map<string, Edge[]>;
    variantsByMain: Map<string, string[]>;
  } {
    const deviceRows = db.select().from(devices).all();
    const edges = db.select().from(romDevices).all();
    const coverage = deviceCoverage();

    const deviceByKey = new Map(
      deviceRows.map((d) => [deviceKey(d.vendor, d.codename), d]),
    );
    const edgesByRom = new Map<string, Edge[]>();
    const romsByDevice = new Map<string, Set<string>>();

    for (const edge of edges) {
      const key = deviceKey(edge.vendor, edge.codename);
      const roms = romsByDevice.get(key);
      if (roms) roms.add(edge.romId);
      else romsByDevice.set(key, new Set([edge.romId]));
      const list = edgesByRom.get(edge.romId);
      if (list) list.push(edge);
      else edgesByRom.set(edge.romId, [edge]);
    }

    // A variant is supported by every ROM that builds its covering target.
    for (const [variantKey, mainKeys] of coverage.mainsByVariant) {
      const roms = romsByDevice.get(variantKey) ?? new Set<string>();
      for (const mainKey of mainKeys) {
        for (const id of romsByDevice.get(mainKey) ?? []) roms.add(id);
      }
      romsByDevice.set(variantKey, roms);
    }

    const romCountByDevice = new Map(
      [...romsByDevice].map(([key, roms]) => [key, roms.size]),
    );

    return {
      deviceByKey,
      romCountByDevice,
      edgesByRom,
      variantsByMain: coverage.variantsByMain,
    };
  }

  function listRoms(): RomDetail[] {
    const { deviceByKey, romCountByDevice, edgesByRom, variantsByMain } =
      indexes();
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
          variantsByMain,
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

    const { deviceByKey, romCountByDevice, variantsByMain } = indexes();
    const edges = db
      .select()
      .from(romDevices)
      .where(eq(romDevices.romId, rom.id))
      .all();

    return buildRom(
      rom,
      edges,
      deviceByKey,
      romCountByDevice,
      variantsByMain,
    );
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
          referenceUrl: edge.referenceUrl,
          reportedCodename: edge.reportedCodename,
        };
      });
  }

  function listVariants(): DeviceVariant[] {
    return db
      .select()
      .from(deviceVariants)
      .orderBy(
        asc(deviceVariants.vendor),
        asc(deviceVariants.codename),
        asc(deviceVariants.variantCodename),
      )
      .all()
      .map((row) => ({
        vendor: row.vendor,
        codename: row.codename,
        variantCodename: row.variantCodename,
        source: row.source,
        evidence: row.evidence,
      }));
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
    listVariants,
    getMeta,
    close: () => sqlite.close(),
  };
}
