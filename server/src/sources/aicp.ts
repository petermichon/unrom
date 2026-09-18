import { buildRecord } from "./adapter.ts";
import type { NormalizedRomDevice } from "../normalized.ts";

const ROM_ID = "aicp";
const ROM_NAME = "AICP";
const SOURCE = "aicp.txt";

const VENDORS: Record<string, string> = {
  samsung: "Samsung",
  oneplus: "OnePlus",
  google: "Google",
  motorola: "Motorola",
  xiaomi: "Xiaomi",
  asus: "Asus",
  sony: "Sony",
  nothing: "Nothing",
  realme: "Realme",
  oppo: "Oppo",
  vivo: "Vivo",
  fairphone: "Fairphone",
  nokia: "Nokia",
};

function vendor(raw: string): string {
  const key = raw.toLowerCase();
  return VENDORS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * aicp-build-targets lines (whitespace separated):
 * `<id> <aicp_codename-buildtype> <oem> <branch> <period> <day> <maintainers> <repos>`
 */
export function parseAICP(raw: string): NormalizedRomDevice[] {
  const records: NormalizedRomDevice[] = [];
  const seen = new Set<string>();

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const fields = trimmed.split(/\s+/);
    const launch = fields[1];
    const oem = fields[2];
    const branch = fields[3];
    if (!launch || !oem || !branch) continue;

    const codename = launch.replace(/^aicp_/, "").replace(/-.*$/, "");
    if (!codename || seen.has(codename)) continue;
    seen.add(codename);

    records.push(
      buildRecord({
        romId: ROM_ID,
        romName: ROM_NAME,
        source: SOURCE,
        referenceUrl:
          "https://github.com/AICP/vendor_jenkins/blob/w16.0/aicp-build-targets",
        codename,
        brand: vendor(oem),
      }),
    );
  }

  return records;
}
