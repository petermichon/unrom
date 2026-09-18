import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice } from "../normalized.ts";
import { expandCodename } from "../data/identity.ts";

export type RawDevice = Record<string, unknown>;

export interface DeviceEntry {
  device: RawDevice;
  codename?: string | null;
  group?: string | null;
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
  referenceUrl?: string[];
  /** Deterministic per-device page, built from the codename when `referenceUrl`
   * is absent. A `{codename}` placeholder is substituted. */
  referencePage?: string;
}

export interface RecordInput {
  romId: string;
  romName: string;
  codename: string;
  name?: string | null;
  brand?: string | null;
  referenceUrl?: string | null;
}

/** Build a validated record, filling the optional fields with defaults. */
export function buildRecord(input: RecordInput): NormalizedRomDevice {
  return normalizedRomDeviceSchema.parse({
    name: null,
    brand: null,
    referenceUrl: null,
    ...input,
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

export function createParser(
  source: DeviceSource,
): (raw: string) => NormalizedRomDevice[] {
  return (raw: string) => {
    const data: unknown = JSON.parse(raw);
    const entries = source.select(data);
    const records: NormalizedRomDevice[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const rawCodename =
        entry.codename ?? pick(entry.device, source.codename ?? ["codename"]);
      if (!rawCodename) continue;

      for (const codename of expandCodename(rawCodename)) {
        if (seen.has(codename)) continue;
        seen.add(codename);

        const referenceUrl =
          pick(entry.device, source.referenceUrl) ??
          (source.referencePage
            ? source.referencePage.replace("{codename}", codename)
            : null);

        records.push(
          normalizedRomDeviceSchema.parse({
            romId: source.id,
            romName: source.romName,
            codename,
            name: pick(entry.device, source.name ?? ["name"]),
            brand:
              pick(entry.device, source.brand ?? ["brand"]) ??
              entry.group ??
              null,
            referenceUrl,
          }),
        );
      }
    }

    return records;
  };
}

export const selectors = {
  array: (data: unknown): DeviceEntry[] =>
    (Array.isArray(data) ? data : []).map((device) => ({
      device: isObject(device) ? device : {},
    })),

  devices:
    (key: string) =>
    (data: unknown): DeviceEntry[] => {
      const list = isObject(data) ? data[key] : undefined;
      return (Array.isArray(list) ? list : []).map((device) => ({
        device: isObject(device) ? device : {},
      }));
    },

  grouped:
    (skip: string[] = []) =>
    (data: unknown): DeviceEntry[] => {
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
