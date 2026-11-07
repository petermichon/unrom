import type { BrowseDevice } from "@/lib/types";

export function deviceName(device: BrowseDevice): string {
  return device.name ?? device.codename;
}

interface BrandedName {
  name: string | null;
  vendorName: string;
  codename: string;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

/**
 * The model name with its brand, unless the name already starts with that
 * brand. Sources are inconsistent: some report "Xiaomi 13", others
 * "Galaxy A52s 5G" under Samsung.
 */
export function brandedDeviceName(device: BrandedName): string {
  const name = device.name ?? device.codename;
  const brand = device.vendorName.trim();
  if (!brand) return name;
  return normalize(name).startsWith(normalize(brand))
    ? name
    : `${brand} ${name}`;
}
