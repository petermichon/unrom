import { parse as parseYaml } from "yaml";

import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "lineageos";
const ROM_NAME = "LineageOS";

interface BuildInfo {
  date: string | null;
  securityPatch: string | null;
}

/**
 * The fetcher stores the wiki YAML for each device plus the newest OTA build
 * per codename. An older snapshot is a bare array of documents with no builds.
 */
function readSnapshot(raw: string): {
  documents: unknown[];
  builds: Map<string, BuildInfo>;
} {
  const data: unknown = JSON.parse(raw);
  if (Array.isArray(data)) return { documents: data, builds: new Map() };

  const snapshot = (data ?? {}) as { documents?: unknown; builds?: unknown };
  const documents = Array.isArray(snapshot.documents) ? snapshot.documents : [];
  const builds = new Map<string, BuildInfo>();

  for (const build of Array.isArray(snapshot.builds) ? snapshot.builds : []) {
    if (!build || typeof build !== "object") continue;
    const entry = build as {
      codename?: unknown;
      date?: unknown;
      securityPatch?: unknown;
    };
    const codename = str(entry.codename);
    if (!codename) continue;
    builds.set(codename, {
      date: str(entry.date),
      securityPatch: str(entry.securityPatch),
    });
  }

  return { documents, builds };
}

/**
 * A codename can appear several times with a numeric `variant` (one model per
 * variant, e.g. `otter` = SHIFTphone 8.0 and 8.1), so documents are merged per
 * codename and every reported model name is kept.
 */
export function parseLineageOS(raw: string): NormalizedRomDevice[] {
  const { documents, builds } = readSnapshot(raw);

  const merged = new Map<
    string,
    { name: string | null; names: string[]; brand: string | null }
  >();

  for (const document of documents) {
    if (typeof document !== "string") continue;

    const meta = parseYaml(document) as Record<string, unknown>;
    const codename = str(meta.codename);
    if (!codename) continue;

    const entry = merged.get(codename) ?? {
      name: null,
      names: [],
      brand: str(meta.vendor),
    };
    const name = str(meta.name);
    if (name) {
      if (!entry.name) entry.name = name;
      if (!entry.names.includes(name)) entry.names.push(name);
    }
    merged.set(codename, entry);
  }

  return [...merged].map(([codename, entry]) => {
    const build = builds.get(codename);
    return buildRecord({
      romId: ROM_ID,
      romName: ROM_NAME,
      codename,
      name: entry.name,
      names: entry.names,
      brand: entry.brand,
      referenceUrl: `https://wiki.lineageos.org/devices/${codename}/`,
      referenceKind: "derived",
      buildDate: build?.date ?? null,
      securityPatch: build?.securityPatch ?? null,
    });
  });
}
