import { writeFile } from "node:fs/promises";

import { createApi } from "../data/queries.ts";
import { DB_PATH, JSON_PATH } from "../paths.ts";

const api = createApi(DB_PATH);

const payload = {
  meta: api.getMeta(),
  devices: api.listDevices(),
  roms: api.listRoms(),
  mappings: api.listMappings(),
  variants: api.listVariants(),
};

api.close();

await writeFile(JSON_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.log(
  `Exported ${JSON_PATH}\n  ${payload.devices.length} device(s), ${payload.roms.length} ROM(s), ${payload.mappings.length} mapping(s)`
);
