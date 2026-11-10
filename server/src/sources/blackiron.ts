import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "black-iron-project";
const ROM_NAME = "Black Iron Project";

interface SnapshotFile {
  path?: unknown;
  text?: unknown;
}

/**
 * One build document per codename under `builds/`. Two upstream documents are
 * not valid JSON, so the snapshot keeps raw text and the fields are read with
 * a pattern instead of a parser. The document carries no model or brand; the
 * registry names the device.
 */
export function parseBlackIron(raw: string): NormalizedRomDevice[] {
  const data = JSON.parse(raw) as { files?: SnapshotFile[] };
  const files = Array.isArray(data.files) ? data.files : [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const file of files) {
    const path = typeof file.path === "string" ? file.path : null;
    const text = typeof file.text === "string" ? file.text : null;
    if (!path || !text) continue;
    if (/"error"\s*:\s*true/.test(text)) continue;

    const status = text.match(/"status"\s*:\s*"([^"]*)"/)?.[1] ?? null;
    if (status && status.toLowerCase() !== "active") continue;

    const codename = path.replace(/^builds\//, "").replace(/\.json$/i, "");
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        referenceUrl: `https://github.com/Black-Iron-Project/OTA/blob/z16/${path}`,
      }),
    );
  }

  return records;
}
