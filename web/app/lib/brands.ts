import type { BrowseDevice } from "@/lib/types";
import { byDirectoryName } from "@/lib/sort";

export interface Brand {
  vendor: string;
  vendorName: string;
  deviceCount: number;
  /** Devices with at least one ROM build. */
  withRoms: number;
}

/**
 * Brand directory order: the brands custom-ROM users are most likely to look
 * for first — those with the most ROM-covered devices — then the largest
 * catalogues, with the A–Z comparator as a stable, hidden tiebreaker.
 */
export function brandRanking(devices: BrowseDevice[]): Brand[] {
  const map = new Map<string, Brand>();
  for (const device of devices) {
    const brand = map.get(device.vendor) ?? {
      vendor: device.vendor,
      vendorName: device.vendorName,
      deviceCount: 0,
      withRoms: 0,
    };
    brand.deviceCount++;
    if (device.roms.length > 0) brand.withRoms++;
    map.set(device.vendor, brand);
  }
  return [...map.values()].sort(
    (a, b) =>
      b.withRoms - a.withRoms ||
      b.deviceCount - a.deviceCount ||
      byDirectoryName(a.vendorName, b.vendorName),
  );
}
