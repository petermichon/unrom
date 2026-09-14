import { devices } from "@/fixtures/devices";
import type {
  BrowseDevice,
  DeviceDetail,
  DeviceSummary,
  Mapping,
  RomDetail,
  RomSummary,
} from "./types";

function toSummary(device: DeviceDetail): DeviceSummary {
  return {
    codename: device.codename,
    name: device.name,
    brand: device.brand,
    romCount: device.roms.length,
  };
}

export function getAllDevices(): DeviceDetail[] {
  return devices;
}

export function findDevice(codename: string): DeviceDetail | null {
  return (
    devices.find(
      (device) => device.codename.toLowerCase() === codename.toLowerCase()
    ) ?? null
  );
}

export function getBrowseDevices(): BrowseDevice[] {
  return devices.map((device) => ({
    codename: device.codename,
    name: device.name,
    brand: device.brand,
    roms: device.roms.map((rom) => ({ id: rom.id, name: rom.name })),
  }));
}

export function getAllRoms(): RomSummary[] {
  const map = new Map<
    string,
    {
      name: string;
      active: boolean;
      count: number;
      androidBases: Set<string>;
      romVersions: Set<string>;
    }
  >();

  for (const device of devices) {
    for (const rom of device.roms) {
      const entry = map.get(rom.id) ?? {
        name: rom.name,
        active: false,
        count: 0,
        androidBases: new Set<string>(),
        romVersions: new Set<string>(),
      };
      entry.count += 1;
      entry.active = entry.active || rom.active;
      for (const version of rom.androidBases) entry.androidBases.add(version);
      if (rom.romVersion) entry.romVersions.add(rom.romVersion);
      map.set(rom.id, entry);
    }
  }

  return [...map.entries()]
    .map(([id, entry]) => ({
      id,
      name: entry.name,
      active: entry.active,
      deviceCount: entry.count,
      androidBases: [...entry.androidBases].sort(),
      romVersions: [...entry.romVersions].sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getRom(id: string): RomDetail | null {
  const supported = devices.filter((device) =>
    device.roms.some((rom) => rom.id === id)
  );
  if (supported.length === 0) return null;

  const info = supported
    .flatMap((device) => device.roms)
    .find((rom) => rom.id === id)!;

  const androidBases = new Set<string>();
  const romVersions = new Set<string>();
  for (const device of supported) {
    for (const rom of device.roms) {
      if (rom.id !== id) continue;
      for (const version of rom.androidBases) androidBases.add(version);
      if (rom.romVersion) romVersions.add(rom.romVersion);
    }
  }

  return {
    id,
    name: info.name,
    active: supported.some((device) =>
      device.roms.some((rom) => rom.id === id && rom.active)
    ),
    deviceCount: supported.length,
    androidBases: [...androidBases].sort(),
    romVersions: [...romVersions].sort(),
    devices: supported
      .map(toSummary)
      .sort((a, b) =>
        (a.name ?? a.codename).localeCompare(b.name ?? b.codename)
      ),
  };
}

export function getBrowseRoms(): RomDetail[] {
  return getAllRoms()
    .map((rom) => getRom(rom.id))
    .filter((rom): rom is RomDetail => rom !== null);
}

export function getMappings(): Mapping[] {
  const rows: Mapping[] = [];
  for (const device of devices) {
    for (const rom of device.roms) {
      rows.push({
        codename: device.codename,
        deviceName: device.name,
        brand: device.brand,
        romId: rom.id,
        romName: rom.name,
        active: rom.active,
        androidBases: rom.androidBases,
        romVersion: rom.romVersion,
        maintainer: rom.maintainer,
        sourceUrl: rom.sourceUrl,
      });
    }
  }
  return rows;
}
