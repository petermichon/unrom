import type { BrowseDevice } from "@/lib/types";

// Bounded so a pathological query cannot turn into unbounded work or SQL.
const MAX_TERMS = 8;

/** Split a query into lowercased terms; every term has to match. */
export function tokenize(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TERMS);
}

/** True when every term appears somewhere in the haystack. */
export function matchesAll(haystack: string, terms: string[]): boolean {
  return terms.every((term) => haystack.includes(term));
}

/**
 * Everything a device can be found by. Terms may match different fields, so
 * `google pixel` finds the Pixel devices of the Google vendor.
 */
export interface RomSearchEntry {
  id: string;
  name: string;
  deviceCount: number;
  /** Lowercased name plus every device the ROM supports. */
  haystack: string;
}

export function deviceHaystack(device: BrowseDevice): string {
  return [
    device.name ?? "",
    ...device.names,
    device.codename,
    device.vendor,
    device.vendorName,
    ...device.aliases,
  ]
    .join(" ")
    .toLowerCase();
}
