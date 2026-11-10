import { buildRecord, str } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "sparkos";
const ROM_NAME = "SparkOS";

const REFERENCE = "https://spark-os.tech/download";

interface NextData {
  props?: {
    pageProps?: {
      devices?: unknown;
    };
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The download page embeds its roster as the Next.js `__NEXT_DATA__` JSON. */
export function parseSparkOS(raw: string): NormalizedRomDevice[] {
  const script = raw.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!script) return [];

  const data = JSON.parse(script[1]!) as NextData;
  const devices = data.props?.pageProps?.devices;
  if (!Array.isArray(devices)) return [];

  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const entry of devices) {
    if (!isObject(entry)) continue;
    if (entry.active === false) continue;

    const codename = str(entry.codename);
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        codename,
        name: str(entry.model),
        brand: str(entry.vendor),
        referenceUrl: REFERENCE,
      }),
    );
  }

  return records;
}
