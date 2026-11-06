import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { vendorForBrand, vendorForName } from "../data/identity.ts";
import { createApi } from "../data/queries.ts";
import { CATALOG_REPORT_PATH, DATA_DIR, DB_PATH, DIST_DIR } from "../paths.ts";
import {
  PLAY_DEVICES_FILE,
  parsePlayDevices,
} from "../sources/play-devices.ts";

interface Group {
  brand: string;
  codename: string;
  names: Set<string>;
  models: Set<string>;
}

const raw = await readFile(join(DATA_DIR, PLAY_DEVICES_FILE), "utf8");
const rows = parsePlayDevices(raw);

const groups = new Map<string, Group>();
for (const row of rows) {
  const key = `${row.brand.toLowerCase()}\0${row.codename.toLowerCase()}`;
  const group = groups.get(key) ?? {
    brand: row.brand,
    codename: row.codename,
    names: new Set<string>(),
    models: new Set<string>(),
  };
  group.names.add(row.name);
  if (row.model) group.models.add(row.model);
  groups.set(key, group);
}

const unique = [...groups.values()].map((group) => {
  const names = [...group.names].sort();
  const vendor = vendorForBrand(group.brand) ?? vendorForName(names[0] ?? null);
  return {
    brand: group.brand,
    vendor,
    codename: group.codename,
    names,
    models: [...group.models].sort(),
  };
});

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

const keyOf = (device: {
  vendor: string | null;
  brand: string;
  codename: string;
}) =>
  `${(device.vendor ?? device.brand).toLowerCase()}\0${device.codename.toLowerCase()}`;

const overlap = unique.filter((device) => currentKeys.has(keyOf(device)));
const added = unique.filter((device) => !currentKeys.has(keyOf(device)));
const knownBrands = new Set(
  unique
    .filter((device) => device.vendor !== null)
    .map((device) => device.brand),
);
const unknownBrands = new Set(
  unique
    .filter((device) => device.vendor === null)
    .map((device) => device.brand),
);

const byBrand = new Map<string, number>();
for (const device of added) {
  const label = device.vendor ?? `? ${device.brand}`;
  byBrand.set(label, (byBrand.get(label) ?? 0) + 1);
}
const topBrands = [...byBrand.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 25)
  .map(([brand, devices]) => ({ brand, devices }));

const samples = added
  .filter((device) => device.names.length > 0)
  .slice(0, 20)
  .map((device) => ({
    vendor: device.vendor,
    brand: device.brand,
    codename: device.codename,
    name: device.names[0],
  }));

const report = {
  source: PLAY_DEVICES_FILE,
  rows: rows.length,
  uniqueDevices: unique.length,
  withNames: unique.filter((device) => device.names.length > 0).length,
  knownBrands: knownBrands.size,
  unknownBrands: unknownBrands.size,
  currentDevices: currentKeys.size,
  overlap: overlap.length,
  added: added.length,
  topBrands,
  samples,
  unknownBrandSamples: [...unknownBrands].sort().slice(0, 25),
};

await mkdir(DIST_DIR, { recursive: true });
await writeFile(CATALOG_REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

console.log(
  `Play catalogue: ${report.rows} rows, ${report.uniqueDevices} unique brand+codename devices\n` +
    `  ${report.withNames} with a name, ${report.knownBrands} known brands, ${report.unknownBrands} unknown brands\n` +
    `  overlap with current ${report.currentDevices} devices: ${report.overlap}\n` +
    `  would add: ${report.added} devices → ${CATALOG_REPORT_PATH}`,
);
