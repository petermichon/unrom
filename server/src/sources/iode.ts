import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "iode";
const ROM_NAME = "iodéOS";
const SUPPORTED_URL = "https://iode.tech/iodeos-official-supported-devices";
// The date the table was read, not a build date.
const VERIFIED_AT = "2026-11-15";

// The official table uses the marketing casing; the registry keys use the
// build codename.
const CODENAME_CORRECTIONS: Record<string, string> = {
  BraX3: "brax3",
  Hawao: "hawao",
};

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

function decode(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * The official supported-devices page is a TablePress table: one row per
 * device, with the codename in the last parenthetical of the model cell. The
 * generic GSI row is not a device.
 *
 * The GitLab release tree only carries the devices with a current build, so
 * this page is the authoritative roster (and the tree remains a fallback for
 * devices that have not been listed there yet).
 */
export function parseIodeHtml(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const row of raw.matchAll(/<tr class="row-\d+">([\s\S]*?)<\/tr>/g)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
      (cell) => decode(cell[1]),
    );
    const brand = cells[0] ?? "";
    const model = cells[1] ?? "";
    // Column 6 is `Bootloader locked?`; the table's own wording is quoted in
    // the summary so the status is auditable.
    const locked = (cells[5] ?? "").toLowerCase();
    if (!brand || !model) continue;
    if (/^GSI\b/i.test(brand) || /^GSI\b/i.test(model)) continue;

    const open = model.lastIndexOf("(");
    const close = model.lastIndexOf(")");
    if (open === -1 || close <= open) continue;

    const name = model.slice(0, open).trim() || null;
    const reported = model.slice(open + 1, close).trim();
    const codename = CODENAME_CORRECTIONS[reported] ?? reported;
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name,
        brand,
        referenceUrl: SUPPORTED_URL,
        relock:
          locked === "yes"
            ? {
                status: "supported",
                summary:
                  'iodéOS lists "Bootloader locked? yes" for this device.',
                sourceUrl: SUPPORTED_URL,
                verifiedAt: VERIFIED_AT,
              }
            : locked === "no"
              ? {
                  status: "unsupported",
                  summary:
                    'iodéOS lists "Bootloader locked? no" for this device.',
                  sourceUrl: SUPPORTED_URL,
                  verifiedAt: VERIFIED_AT,
                }
              : null,
      }),
    );
  }

  return records;
}
