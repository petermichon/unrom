import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "nameless-aosp";
const ROM_NAME = "Nameless AOSP";

// The SourceForge projects also hold non-device folders. `lahaina` is the
// shared OnePlus 9 target; its devices have their own folders.
const NON_DEVICE_DIRS = new Set(["lahaina", "latest", "stats", "wip"]);

/**
 * The SourceForge file listing links each device folder as
 * `/projects/<project>/files/<codename>/`. `-oos11` folders are firmware
 * variants of the same device.
 */
export function parseNamelessAosp(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const match of raw.matchAll(
    /\/projects\/([^/]+)\/files\/([^/"?]+)\//g,
  )) {
    const project = match[1];
    const directory = match[2];
    if (NON_DEVICE_DIRS.has(directory.toLowerCase())) continue;

    const codename = directory.replace(/-oos11$/i, "");
    if (!codename || seen.has(codename.toLowerCase())) continue;
    seen.add(codename.toLowerCase());

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        referenceUrl: `https://sourceforge.net/projects/${project}/files/${directory}/`,
      }),
    );
  }

  return records;
}
