import type { BrowseDevice } from "@/lib/types";
import { byBrandName } from "@/lib/sort";

export interface Brand {
  vendor: string;
  vendorName: string;
  deviceCount: number;
  /** Devices with at least one ROM build. */
  withRoms: number;
  /** Distinct ROMs covering at least one device of this brand. */
  romCount: number;
}

/**
 * Brand directory order: the brands custom-ROM users are most likely to look
 * for first — those with the most ROM-covered devices — then the largest
 * catalogues, with the A–Z comparator as a stable, hidden tiebreaker.
 */
export function brandRanking(devices: BrowseDevice[]): Brand[] {
  const map = new Map<string, Brand & { romIds: Set<string> }>();
  for (const device of devices) {
    const brand = map.get(device.vendor) ?? {
      vendor: device.vendor,
      vendorName: device.vendorName,
      deviceCount: 0,
      withRoms: 0,
      romCount: 0,
      romIds: new Set<string>(),
    };
    brand.deviceCount++;
    if (device.roms.length > 0) brand.withRoms++;
    for (const rom of device.roms) brand.romIds.add(rom.id);
    map.set(device.vendor, brand);
  }
  return [...map.values()]
    .map(({ romIds, ...brand }) => ({ ...brand, romCount: romIds.size }))
    .sort(
      (a, b) =>
        b.withRoms - a.withRoms ||
        b.deviceCount - a.deviceCount ||
        byBrandName(a.vendorName, b.vendorName),
    );
}

export interface BrandGroup {
  /** Uppercase letter, or `#` for names starting with a digit. */
  letter: string;
  brands: Brand[];
}

/** A–Z groups for the full directory; numeric names are the last group. */
export function brandGroups(brands: Brand[]): BrandGroup[] {
  const groups: BrandGroup[] = [];
  const index = new Map<string, BrandGroup>();

  for (const brand of [...brands].sort((a, b) =>
    byBrandName(a.vendorName, b.vendorName),
  )) {
    const first = brand.vendorName.replace(/^[^\p{L}\p{N}]+/u, "").charAt(0);
    const letter = /^\p{L}/u.test(first) ? first.toUpperCase() : "#";
    let group = index.get(letter);
    if (!group) {
      group = { letter, brands: [] };
      index.set(letter, group);
      groups.push(group);
    }
    group.brands.push(brand);
  }

  return groups;
}
