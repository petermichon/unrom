import { buildRecord } from "./adapter.ts";
import { normalizedRomDeviceSchema } from "../normalized.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "eos";
const ROM_NAME = "/e/OS";

/**
 * /e/OS publishes one GitLab CI file per branch. Each build job lists its
 * devices in a `DEVICES: "..."` variable.
 */
export function createEosParser(): (raw: string) => NormalizedRomDevice[] {
  return (raw: string) => {
    const records: NormalizedRomDevice[] = [];
    const seen = new Set<string>();

    for (const match of raw.matchAll(/DEVICES:\s*"([^"]*)"/g)) {
      for (const rawCodename of match[1].split(/\s+/)) {
        const codename = rawCodename.trim();
        if (!codename || seen.has(codename)) continue;
        seen.add(codename);

        records.push(
          buildRecord({
            romId: ROM_ID,
            romName: ROM_NAME,
            codename,
            referenceUrl: `https://doc.e.foundation/devices/${codename}`,
            referenceKind: "derived",
          }),
        );
      }
    }

    return records;
  };
}

function absoluteDeviceUrl(href: string): string | null {
  try {
    const url = new URL(href, "https://doc.e.foundation/devices/");
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function decode(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * The official devices page renders one table row per device: the brand cell,
 * the model link, and the codename chip. It is the current roster; the frozen
 * CI snapshots remain because that repo is no longer publicly readable.
 */
export function parseEosHtml(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const row of raw.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
    const body = row[1];
    const chip = body.match(/<span class=["']?chip["']?>([^<]+)<\/span>/);
    if (!chip) continue;

    const codename = decode(chip[1]);
    if (!codename || seen.has(codename)) continue;

    const brandCell = body.match(
      /<td class=["']?brand["']?[^>]*>([\s\S]*?)<\/td>/,
    );
    // The row links its own device page. Use that link rather than building it
    // from the codename: a device can leave the roster and keep a live page, or
    // stay listed with a page that is gone, and only the published link says
    // which. The template is the fallback for a row that omits the anchor.
    const nameCell = body.match(
      /<td[^>]*data-label=["']?Name["']?[^>]*>[\s\S]*?<a([^>]*)>([^<]+)<\/a>/,
    );
    const hrefAttr = nameCell?.[1].match(/href=["']?([^"'\s>]+)/i)?.[1];
    const href = hrefAttr ? absoluteDeviceUrl(hrefAttr) : null;

    seen.add(codename);
    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: nameCell ? decode(nameCell[2]) : null,
        brand: brandCell ? decode(brandCell[1]) : null,
        referenceUrl: href ?? `https://doc.e.foundation/devices/${codename}`,
        referenceKind: href ? "observed" : "derived",
      }),
    );
  }

  return records;
}

interface RelockEntry {
  codename?: unknown;
  status?: unknown;
  summary?: unknown;
  sourceUrl?: unknown;
  verifiedAt?: unknown;
}

/**
 * The fetcher stores the devices index plus the relock statement each device
 * page makes. An older snapshot is a bare HTML page with no statements.
 */
export function parseEos(raw: string): NormalizedRomDevice[] {
  const data: unknown = JSON.parse(raw);
  const snapshot = (data ?? {}) as { page?: unknown; relock?: unknown };
  if (typeof snapshot.page !== "string") return [];

  const relock = new Map<
    string,
    {
      status: "supported" | "unsupported" | "unknown";
      summary: string;
      sourceUrl: string;
      verifiedAt: string;
    }
  >();
  for (const entry of Array.isArray(snapshot.relock) ? snapshot.relock : []) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as RelockEntry;
    const codename = typeof item.codename === "string" ? item.codename : null;
    const status =
      item.status === "supported" ||
      item.status === "unsupported" ||
      item.status === "unknown"
        ? item.status
        : null;
    if (
      !codename ||
      !status ||
      typeof item.summary !== "string" ||
      typeof item.sourceUrl !== "string" ||
      typeof item.verifiedAt !== "string"
    ) {
      continue;
    }
    relock.set(codename, {
      status,
      summary: item.summary,
      sourceUrl: item.sourceUrl,
      verifiedAt: item.verifiedAt,
    });
  }

  return parseEosHtml(snapshot.page).map((record) => {
    const statement = relock.get(record.codename);
    return statement
      ? normalizedRomDeviceSchema.parse({ ...record, relock: statement })
      : record;
  });
}
