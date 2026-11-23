import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "carbon-rom";
const ROM_NAME = "Carbon ROM";

const PAGE = "https://get.carbonrom.org";

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

function text(value: string): string {
  return value
    .replace(
      /&(amp|quot|#39|#x27|lt|gt);/g,
      (entity) => ENTITIES[entity] ?? entity,
    )
    .trim();
}

function parseDate(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/**
 * The mirror index is one table row per published build: the first cell links
 * the device page and names the model, the last cell carries the build date.
 * The roster is the set of device pages, taking each device's newest build.
 */
export function parseCarbonRom(raw: string): NormalizedRomDevice[] {
  const devices = new Map<
    string,
    { name: string | null; buildDate: string | null }
  >();

  for (const row of raw.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const html = row[1] ?? "";
    const device = html.match(
      /<a href="\/device-([a-z0-9._-]+)\.html"[^>]*>[\s\S]*?<\/a>\s*<br>\s*<small>([\s\S]*?)<\/small>/i,
    );
    if (!device) continue;

    const codename = device[1]!;
    const name = text(device[2]!.replace(/<[^>]+>/g, " ")) || null;
    const cells = [...html.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
    const dateCell = cells
      .at(-1)?.[1]
      ?.replace(/<[^>]+>/g, " ")
      .trim();
    const buildDate = dateCell ? parseDate(dateCell) : null;

    const existing = devices.get(codename);
    if (!existing) {
      devices.set(codename, { name, buildDate });
      continue;
    }
    if (!existing.name && name) existing.name = name;
    if (buildDate && (!existing.buildDate || buildDate > existing.buildDate)) {
      existing.buildDate = buildDate;
    }
  }

  return [...devices].map(([codename, device]) =>
    buildRecord({
      romId: ROM_ID,
      romName: ROM_NAME,
      codename,
      name: device.name,
      referenceUrl: `${PAGE}/device-${codename}.html`,
      buildDate: device.buildDate,
    }),
  );
}
