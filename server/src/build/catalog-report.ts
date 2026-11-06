import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { createApi } from "../data/queries.ts";
import { CATALOG_REPORT_PATH, DATA_DIR, DB_PATH, DIST_DIR } from "../paths.ts";
import { selectCatalog } from "../sources/catalog.ts";
import {
  PLAY_DEVICES_FILE,
  parsePlayDevices,
} from "../sources/play-devices.ts";

const raw = await readFile(join(DATA_DIR, PLAY_DEVICES_FILE), "utf8");
const rows = parsePlayDevices(raw);
const selection = selectCatalog(rows);

const currentKeys = new Set<string>();
if (existsSync(DB_PATH)) {
  const api = createApi(DB_PATH);
  for (const device of api.listDevices()) {
    currentKeys.add(
      `${device.vendor.toLowerCase()}\0${device.codename.toLowerCase()}`,
    );
  }
  api.close();
}

const keyOf = (entry: { vendor: string; codename: string }) =>
  `${entry.vendor.toLowerCase()}\0${entry.codename.toLowerCase()}`;

const added = selection.entries.filter(
  (entry) => !currentKeys.has(keyOf(entry)),
);
const overlap = selection.entries.length - added.length;

const byBrand = new Map<string, number>();
for (const entry of added) {
  byBrand.set(entry.vendor, (byBrand.get(entry.vendor) ?? 0) + 1);
}
const topBrands = [...byBrand.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 25)
  .map(([vendor, devices]) => ({ vendor, devices }));

const samples = added.slice(0, 20).map((entry) => ({
  vendor: entry.vendor,
  codename: entry.codename,
  name: entry.name,
  formFactor: entry.formFactor,
}));

const report = {
  source: PLAY_DEVICES_FILE,
  rows: rows.length,
  uniqueBrandCodename: selection.uniqueDevices,
  included: selection.entries.length,
  exclusions: selection.exclusions,
  formFactors: selection.formFactors,
  currentDevices: currentKeys.size,
  overlap,
  added: added.length,
  topBrands,
  samples,
};

await mkdir(DIST_DIR, { recursive: true });
await writeFile(CATALOG_REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

console.log(
  `Play catalogue: ${report.rows} rows\n` +
    `  excluded: ${selection.exclusions.brand} unknown brands, ${selection.exclusions.name} unusable names, ${selection.exclusions.formFactor} untracked form factors\n` +
    `  included: ${selection.entries.length} devices (${Object.entries(
      selection.formFactors,
    )
      .filter(([, count]) => count > 0)
      .map(([kind, count]) => `${kind} ${count}`)
      .join(", ")})\n` +
    `  overlap with current ${report.currentDevices}: ${overlap}\n` +
    `  would add: ${added.length} → ${CATALOG_REPORT_PATH}`,
);
