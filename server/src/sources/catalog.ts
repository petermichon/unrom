import { vendorForBrand, vendorForName } from "../data/identity.ts";
import type { CatalogDevice } from "./play-devices.ts";

export type FormFactor =
  | "phone"
  | "tablet"
  | "tv"
  | "handheld"
  | "devkit"
  | "watch"
  | "auto"
  | "other";

const WATCH_RE = /\b(watch|smartwatch|wear os|wearos)/i;
const AUTO_RE = /\b(car|auto|automotive|head unit|infotainment|vehicle)\b/i;
const TV_RE =
  /\b(tv|television|chromecast|android tv|fire tv|projector|streaming|roku|apple tv|tv box|set-top|set top|stick|dongle)\b/i;
const TABLET_RE =
  /\b(tablet|tab|pad|matepad|nexus (7|9|10)|galaxy tab|mediapad)\b/i;
const HANDHELD_RE =
  /\b(handheld|console|switch|odin|retroid|anbernic|steam deck|playdate|game ?pad)\b/i;
const DEVKIT_RE =
  /\b(developer kit|devkit|dev kit|development board|odroid|jetson|qrd|eval board|single board|sbc|banana pi|radxa|droidlogic)\b/i;

const DEVKIT_BRANDS = new Set([
  "bananapi",
  "droidlogic",
  "hardkernel",
  "qualcomm",
  "radxa",
]);

/** Best-effort form factor from the brand and marketing names. */
export function classifyFormFactor(
  brand: string,
  names: readonly string[],
): FormFactor {
  const text = `${brand} ${names.join(" ")}`;
  const vendor = vendorForBrand(brand);
  if (vendor && DEVKIT_BRANDS.has(vendor)) return "devkit";
  if (DEVKIT_RE.test(text)) return "devkit";
  if (WATCH_RE.test(text)) return "watch";
  if (AUTO_RE.test(text)) return "auto";
  if (HANDHELD_RE.test(text)) return "handheld";
  if (TV_RE.test(text)) return "tv";
  if (TABLET_RE.test(text)) return "tablet";
  if (/\b(jamboard)\b/i.test(text)) return "other";
  return "phone";
}

export function isIncludedFormFactor(formFactor: FormFactor): boolean {
  return (
    formFactor !== "watch" && formFactor !== "auto" && formFactor !== "other"
  );
}

/** A name must be usable as a model name, not a codename or placeholder. */
export function isPlausibleName(name: string, codename: string): boolean {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!/\p{L}/u.test(trimmed)) return false;
  if (trimmed.length < 2) return false;
  if (trimmed.toLowerCase() === codename.toLowerCase()) return false;
  // Source names like `10or_G2` are internal identifiers, not model names.
  if (trimmed.includes("_")) return false;
  return true;
}

export interface CatalogEntry {
  vendor: string;
  brand: string;
  codename: string;
  name: string;
  names: string[];
  models: string[];
  formFactor: FormFactor;
}

export interface CatalogExclusions {
  brand: number;
  name: number;
  formFactor: number;
}

export interface CatalogSelection {
  uniqueDevices: number;
  entries: CatalogEntry[];
  exclusions: CatalogExclusions;
  formFactors: Record<FormFactor, number>;
}

/**
 * Group the raw Play rows into one entry per `(vendor, codename)` and apply
 * the three ingestion gates: known brand, plausible names, tracked form
 * factors. Excluded rows are only counted here; the raw snapshot is untouched.
 */
export function selectCatalog(
  devices: readonly CatalogDevice[],
): CatalogSelection {
  const groups = new Map<
    string,
    { brand: string; codename: string; names: Set<string>; models: Set<string> }
  >();

  for (const device of devices) {
    const key = `${device.brand.toLowerCase()}\0${device.codename.toLowerCase()}`;
    const group = groups.get(key) ?? {
      brand: device.brand,
      codename: device.codename,
      names: new Set<string>(),
      models: new Set<string>(),
    };
    group.names.add(device.name);
    if (device.model) group.models.add(device.model);
    groups.set(key, group);
  }

  const exclusions: CatalogExclusions = { brand: 0, name: 0, formFactor: 0 };
  const formFactors: Record<FormFactor, number> = {
    phone: 0,
    tablet: 0,
    tv: 0,
    handheld: 0,
    devkit: 0,
    watch: 0,
    auto: 0,
    other: 0,
  };
  const included = new Map<string, CatalogEntry>();

  for (const group of groups.values()) {
    const names = [...group.names].sort();
    const vendor =
      vendorForBrand(group.brand) ?? vendorForName(names[0] ?? null);
    if (!vendor) {
      exclusions.brand++;
      continue;
    }

    const plausible = names.filter((name) =>
      isPlausibleName(name, group.codename),
    );
    if (plausible.length === 0) {
      exclusions.name++;
      continue;
    }

    const formFactor = classifyFormFactor(group.brand, plausible);
    if (!isIncludedFormFactor(formFactor)) {
      exclusions.formFactor++;
      continue;
    }

    const key = `${vendor.toLowerCase()}\0${group.codename.toLowerCase()}`;
    const existing = included.get(key);
    if (existing) {
      for (const name of plausible) {
        if (!existing.names.includes(name)) existing.names.push(name);
      }
      existing.names.sort();
      existing.name = existing.names[0] ?? existing.name;
    } else {
      included.set(key, {
        vendor,
        brand: group.brand,
        codename: group.codename,
        name: plausible[0] ?? group.codename,
        names: plausible,
        models: [...group.models].sort(),
        formFactor,
      });
      formFactors[formFactor]++;
    }
  }

  return {
    uniqueDevices: groups.size,
    entries: [...included.values()].sort(
      (a, b) =>
        a.vendor.localeCompare(b.vendor) ||
        a.codename.localeCompare(b.codename),
    ),
    exclusions,
    formFactors,
  };
}
