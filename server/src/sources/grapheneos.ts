import { buildRecord, normalizeDate, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "grapheneos";
const ROM_NAME = "GrapheneOS";
const BRAND = "Google";
const REFERENCE = "https://grapheneos.org/faq#supported-devices";

export interface SupportedDevice {
  name: string | null;
  codename: string;
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
 * The FAQ lists official devices as `<li>Pixel 9 (tokay)</li>` immediately
 * after the "official production support" sentence. Only that first list is
 * current support; later lists cover legacy devices and requirements.
 */
export function parseSupportedDevices(html: string): SupportedDevice[] {
  const list = html.match(
    /official production support for the following devices:<\/p>\s*<ul>(.*?)<\/ul>/s,
  )?.[1];
  if (!list) return [];

  const devices: SupportedDevice[] = [];
  for (const item of list.matchAll(/<li>(.*?)<\/li>/gs)) {
    const label = decode(item[1]);
    const open = label.lastIndexOf("(");
    const close = label.lastIndexOf(")");
    if (open === -1 || close <= open) continue;

    const name = label.slice(0, open).trim() || null;
    const codename = label.slice(open + 1, close).trim();
    if (!codename) continue;
    devices.push({ name, codename });
  }
  return devices;
}

/**
 * The releases page stores the FAQ plus each device's newest release, as the
 * release host reports it (`<version> <unix timestamp> <codename> <channel>`),
 * and the changelog, which names the Android security patch level of each
 * release. A release can freeze a device's patch level when the vendor stops
 * shipping firmware, so the freeze is applied over the release-wide level.
 */
export interface ReleaseNote {
  version: string;
  /** The `full YYYY-MM-DD Pixel security patch level` bullet of the release. */
  patchLevel: string | null;
  /** Devices whose patch level this release froze, by product name. */
  frozen: { names: string[]; date: string }[];
}

const ARTICLES = /<article id=(\d{10})>([\s\S]*?)<\/article>/g;

export function parseReleaseNotes(html: string): Map<string, ReleaseNote> {
  const notes = new Map<string, ReleaseNote>();
  for (const article of html.matchAll(ARTICLES)) {
    const version = article[1];
    const body = article[2];
    const text = decode(body);
    const patchLevel =
      /full (\d{4}-\d{2}-\d{2}) Pixel security patch level/.exec(text)?.[1] ??
      null;

    const frozen: ReleaseNote["frozen"] = [];
    const freeze = /patch level has been frozen at (\d{4}-\d{2}-\d{2})/i.exec(
      text,
    );
    if (freeze) {
      // The affected products are named in the same paragraph, before the
      // sentence that explains they no longer receive updates.
      const paragraph = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
        .map((entry) => decode(entry[1]))
        .find((entry) => /patch level has been frozen at/i.test(entry));
      const named = paragraph
        ? /^(.+?) no longer receive updates/i.exec(paragraph)?.[1]
        : undefined;
      const names = named
        ? named
            .split(/\s*,\s*|\s+and\s+/)
            .map((name) => name.trim())
            .filter(Boolean)
        : [];
      // Without the product names there is no way to apply the freeze, so the
      // release-wide level stays and the gap is visible rather than invented.
      if (names.length) frozen.push({ names, date: freeze[1] });
    }

    notes.set(version, { version, patchLevel, frozen });
  }
  return notes;
}

function patchLevelFor(
  note: ReleaseNote | undefined,
  name: string | null,
): string | null {
  if (!note) return null;
  if (name) {
    const frozen = note.frozen.find((entry) => entry.names.includes(name));
    if (frozen) return frozen.date;
  }
  return note.patchLevel;
}

export function parseGrapheneOS(raw: string): NormalizedRomDevice[] {
  const data: unknown = JSON.parse(raw);
  if (typeof data !== "object" || data === null) return [];

  const snapshot = data as {
    page?: unknown;
    releases?: unknown;
    builds?: unknown;
  };
  if (typeof snapshot.page !== "string") return [];

  const notes =
    typeof snapshot.releases === "string"
      ? parseReleaseNotes(snapshot.releases)
      : new Map<string, ReleaseNote>();

  const builds = new Map<string, { version: string; date: string }>();
  for (const build of Array.isArray(snapshot.builds) ? snapshot.builds : []) {
    if (!build || typeof build !== "object") continue;
    const entry = build as {
      codename?: unknown;
      version?: unknown;
      date?: unknown;
    };
    const codename = str(entry.codename);
    const version = str(entry.version);
    const date = normalizeDate(entry.date);
    if (codename && version && /^\d{10}$/.test(version) && date) {
      builds.set(codename, { version, date });
    }
  }

  return parseSupportedDevices(snapshot.page).map((device) => {
    const build = builds.get(device.codename);
    return buildRecord({
      romId: ROM_ID,
      romName: ROM_NAME,
      codename: device.codename,
      name: device.name,
      brand: BRAND,
      referenceUrl: REFERENCE,
      buildDate: build?.date ?? null,
      securityPatch: patchLevelFor(
        build ? notes.get(build.version) : undefined,
        device.name,
      ),
    });
  });
}
