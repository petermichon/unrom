import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice, NormalizedVersion } from "../normalized.ts";

export type RawDevice = Record<string, unknown>;

export interface DeviceEntry {
  device: RawDevice;
  codename?: string | null;
  group?: string | null;
}

export interface BasesSpec {
  key: string;
  pick?: string;
}

/**
 * Declarative description of a ROM source. Sources whose raw shape does not fit
 * these primitives get a hand-written parser instead (see `pixelos.ts`).
 */
export interface DeviceSource {
  id: string;
  romName: string;
  file: string;
  select: (data: unknown) => DeviceEntry[];
  codename?: string[];
  name?: string[];
  brand?: string[];
  maintainer?: string[];
  sourceUrl?: string[];
  active?: string[];
  bases?: BasesSpec;
  defaultActive?: boolean;
}

export interface RecordInput {
  romId: string;
  romName: string;
  source: string;
  codename: string;
  name?: string | null;
  brand?: string | null;
  /** Single version pair; prefer `versions` when several are known. */
  romVersion?: string | null;
  androidBase?: string | null;
  versions?: NormalizedVersion[];
  active?: boolean;
  maintainer?: string | null;
  sourceUrl?: string | null;
}

/** Build a validated record, filling the optional fields with defaults. */
export function buildRecord(input: RecordInput): NormalizedRomDevice {
  const { romVersion, androidBase, versions, ...rest } = input;
  const pairs =
    versions ??
    (romVersion || androidBase
      ? [{ romVersion: romVersion ?? null, androidBase: androidBase ?? null }]
      : []);

  return normalizedRomDeviceSchema.parse({
    name: null,
    brand: null,
    active: true,
    maintainer: null,
    sourceUrl: null,
    ...rest,
    versions: pairs,
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function str(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (Array.isArray(value)) {
    const parts = value
      .map(str)
      .filter((part): part is string => part !== null);
    return parts.length ? parts.join(", ") : null;
  }
  if (isObject(value)) return str(value.name);
  return null;
}

/**
 * Resolve a dotted path against an object. A segment ending in `[]` maps over an
 * array, e.g. `supported_versions[].version_code`.
 */
function pluck(root: unknown, path: string): unknown {
  let current: unknown[] = [root];

  for (const segment of path.split(".")) {
    const map = segment.endsWith("[]");
    const key = map ? segment.slice(0, -2) : segment;
    const next: unknown[] = [];

    for (const node of current) {
      const value = key === "" ? node : isObject(node) ? node[key] : undefined;
      if (map) {
        if (Array.isArray(value)) next.push(...value);
      } else if (value !== undefined) {
        next.push(value);
      }
    }

    current = next;
  }

  if (current.length === 0) return undefined;
  return current.length === 1 ? current[0] : current;
}

function pick(device: RawDevice, keys: string[] | undefined): string | null {
  if (!keys) return null;
  for (const key of keys) {
    const value = str(pluck(device, key));
    if (value) return value;
  }
  return null;
}

const TRUE_WORDS = new Set([
  "true",
  "yes",
  "active",
  "stable",
  "nightly",
  "weekly",
  "official",
  "enabled",
]);
const FALSE_WORDS = new Set([
  "false",
  "no",
  "inactive",
  "discontinued",
  "eol",
  "dead",
  "disabled",
  "unmaintained",
]);

export function asBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const word = value.trim().toLowerCase();
    if (TRUE_WORDS.has(word)) return true;
    if (FALSE_WORDS.has(word)) return false;
  }
  return fallback;
}

function activeValue(
  device: RawDevice,
  keys: string[] | undefined,
  fallback: boolean
): boolean {
  if (keys) {
    for (const key of keys) {
      if (device[key] !== undefined) return asBool(device[key], fallback);
    }
  }
  return fallback;
}

const ANDROID_BASES: Record<string, string> = {
  kitkat: "4",
  lollipop: "5",
  marshmallow: "6",
  nougat: "7",
  oreo: "8",
  pie: "9",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  twelve_plus: "12",
  thirteen: "13",
  thirteen_plus: "13",
  fourteen: "14",
  fourteen_plus: "14",
  fifteen: "15",
  fifteen_plus: "15",
  sixteen: "16",
  seventeen: "17",
};

export function androidBase(value: unknown): string | null {
  const raw = str(value);
  if (!raw) return null;
  const word = raw
    .toLowerCase()
    .replace(/^android\s*/, "")
    .replace(/[\s.]+/g, "_");
  if (/^\d+$/.test(word)) return word;
  return ANDROID_BASES[word] ?? null;
}

function collectBases(device: RawDevice, spec: BasesSpec | undefined): string[] {
  if (!spec) return [];
  const raw = device[spec.key];
  const items = Array.isArray(raw) ? raw : raw === undefined || raw === null ? [] : [raw];
  const bases: string[] = [];

  for (const item of items) {
    const value = spec.pick && isObject(item) ? item[spec.pick] : item;
    const base = androidBase(value);
    if (base && !bases.includes(base)) bases.push(base);
  }

  return bases;
}

export function createParser(
  source: DeviceSource
): (raw: string) => NormalizedRomDevice[] {
  return (raw: string) => {
    const data: unknown = JSON.parse(raw);
    const entries = source.select(data);
    const records: NormalizedRomDevice[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const codename =
        entry.codename ?? pick(entry.device, source.codename ?? ["codename"]);
      if (!codename || seen.has(codename)) continue;
      seen.add(codename);

      records.push(
        normalizedRomDeviceSchema.parse({
          romId: source.id,
          romName: source.romName,
          codename,
          name: pick(entry.device, source.name ?? ["name"]),
          brand:
            pick(entry.device, source.brand ?? ["brand"]) ?? entry.group ?? null,
          versions: collectBases(entry.device, source.bases).map((base) => ({
            androidBase: base,
            romVersion: null,
          })),
          active: activeValue(
            entry.device,
            source.active,
            source.defaultActive ?? true
          ),
          maintainer: pick(entry.device, source.maintainer),
          sourceUrl: pick(entry.device, source.sourceUrl),
          source: source.file,
        })
      );
    }

    return records;
  };
}

export const selectors = {
  array: (data: unknown): DeviceEntry[] =>
    (Array.isArray(data) ? data : []).map((device) => ({
      device: isObject(device) ? device : {},
    })),

  devices: (key: string) => (data: unknown): DeviceEntry[] => {
    const list = isObject(data) ? data[key] : undefined;
    return (Array.isArray(list) ? list : []).map((device) => ({
      device: isObject(device) ? device : {},
    }));
  },

  grouped: (skip: string[] = []) => (data: unknown): DeviceEntry[] => {
    const entries: DeviceEntry[] = [];
    if (!isObject(data)) return entries;

    for (const [group, value] of Object.entries(data)) {
      if (skip.includes(group) || !isObject(value)) continue;
      for (const [codename, info] of Object.entries(value)) {
        entries.push({
          codename,
          group,
          device: isObject(info) ? info : { name: info },
        });
      }
    }

    return entries;
  },
};
