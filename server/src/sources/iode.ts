import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "iode";
const ROM_NAME = "iodéOS";

interface TreeEntry {
  name?: unknown;
  type?: unknown;
  path?: unknown;
}

/**
 * iodéOS's GitLab API is protected by an anti-bot challenge, so the fetcher
 * stores its repository tree. Each top-level directory is a device codename;
 * the listing carries no names or versions.
 */
export function parseIode(raw: string): NormalizedRomDevice[] {
  const entries = JSON.parse(raw) as unknown;
  if (!Array.isArray(entries)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue;
    const node = entry as TreeEntry;
    if (node.type !== "tree") continue;

    const path = str(node.path);
    if (!path || path.includes("/")) continue;

    const codename = str(node.name) ?? path;
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        referenceUrl: "https://iode.tech/iodeos-official-supported-devices",
        codename,
      }),
    );
  }

  return records;
}
