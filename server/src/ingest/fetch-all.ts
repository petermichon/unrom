import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { listDevices as listAfterlifeOS } from "./fetch/afterlifeos.ts";
import { listDevices as listAICP } from "./fetch/aicp.ts";
import { listDevices as listArrowOS } from "./fetch/arrowos.ts";
import { listDevices as listAwakenOS } from "./fetch/awakenos.ts";
import { listDevices as listBlissROMs } from "./fetch/blissroms.ts";
import { listDevices as listCherishOS } from "./fetch/cherishos.ts";
import { listDevices as listClover } from "./fetch/clover.ts";
import { listDevices as listCorvusOS } from "./fetch/corvusos.ts";
import { listDevices as listDotOS } from "./fetch/dotos.ts";
import { listDevices as listDroidXUI } from "./fetch/droidxui.ts";
import {
  listDevicesA14 as listEOSA14,
  listDevicesA15 as listEOSA15,
  listDevicesA16 as listEOSA16,
  listDevicesV1S as listEOSV1S,
  listDevicesV1T as listEOSV1T,
} from "./fetch/eos.ts";
import { listDevices as listEvolutionX } from "./fetch/evolutionx.ts";
import { listDevices as listHavocOS } from "./fetch/havocos.ts";
import { listDevices as listIode } from "./fetch/iode.ts";
import { listDevices as listKaliNetHunter } from "./fetch/kali-nethunter.ts";
import { listDevices as listKenvyra } from "./fetch/kenvyra.ts";
import { listDevices as listLineageOS } from "./fetch/lineageos.ts";
import { listDevices as listMatrixx } from "./fetch/matrixx.ts";
import { listDevices as listMistOS } from "./fetch/mistos.ts";
import { listDevices as listParanoidAndroid } from "./fetch/paranoidandroid.ts";
import { listDevices as listPixelExperience } from "./fetch/pixelexperience.ts";
import { listDevices as listPixelOS } from "./fetch/pixelos.ts";
import { listDevices as listProjectInfinityX } from "./fetch/projectinfinityx.ts";
import { listDevices as listPixysOS } from "./fetch/pixysos.ts";
import { listDevices as listProjectPixelAge } from "./fetch/projectpixelage.ts";
import { listDevices as listRisingOS } from "./fetch/risingos.ts";
import { DATA_DIR } from "../paths.ts";

type DeviceList = () => Promise<string | Error>;

interface Source {
  id: string;
  file: string;
  fetch: DeviceList;
}

const sources: Source[] = [
  { id: "afterlifeos", file: "afterlifeos.json", fetch: listAfterlifeOS },
  { id: "aicp", file: "aicp.txt", fetch: listAICP },
  { id: "arrowos", file: "arrowos.txt", fetch: listArrowOS },
  { id: "awakenos", file: "awakenos.json", fetch: listAwakenOS },
  { id: "blissroms", file: "blissroms.json", fetch: listBlissROMs },
  { id: "cherishos", file: "cherishos.json", fetch: listCherishOS },
  { id: "clover", file: "clover.json", fetch: listClover },
  { id: "corvusos", file: "corvusos.json", fetch: listCorvusOS },
  { id: "dotos", file: "dotos.json", fetch: listDotOS },
  { id: "droidxui", file: "droidxui.json", fetch: listDroidXUI },
  { id: "eos-v1-s", file: "eos-v1-s.yml", fetch: listEOSV1S },
  { id: "eos-v1-t", file: "eos-v1-t.yml", fetch: listEOSV1T },
  { id: "eos-a14", file: "eos-a14.yml", fetch: listEOSA14 },
  { id: "eos-a15", file: "eos-a15.yml", fetch: listEOSA15 },
  { id: "eos-a16", file: "eos-a16.yml", fetch: listEOSA16 },
  { id: "evolutionx", file: "evolutionx.json", fetch: listEvolutionX },
  { id: "havocos", file: "havocos.txt", fetch: listHavocOS },
  { id: "iode", file: "iode.json", fetch: listIode },
  { id: "kali-nethunter", file: "kali-nethunter.yml", fetch: listKaliNetHunter },
  { id: "kenvyra", file: "kenvyra.json", fetch: listKenvyra },
  { id: "lineageos", file: "lineageos.json", fetch: listLineageOS },
  { id: "matrixx", file: "matrixx.json", fetch: listMatrixx },
  { id: "mistos", file: "mistos.json", fetch: listMistOS },
  { id: "paranoidandroid", file: "paranoidandroid.json", fetch: listParanoidAndroid },
  { id: "pixelexperience", file: "pixelexperience.json", fetch: listPixelExperience },
  { id: "pixelos", file: "pixelos.json", fetch: listPixelOS },
  { id: "pixysos", file: "pixysos.json", fetch: listPixysOS },
  { id: "projectinfinityx", file: "projectinfinityx.json", fetch: listProjectInfinityX },
  { id: "projectpixelage", file: "projectpixelage.json", fetch: listProjectPixelAge },
  { id: "risingos", file: "risingos.md", fetch: listRisingOS },
];

const only = process.argv.slice(2);
const selected = only.length
  ? sources.filter((source) => only.includes(source.id))
  : sources;

if (only.length && selected.length === 0) {
  console.error(`No matching sources for: ${only.join(", ")}`);
  console.error(`Available: ${sources.map((source) => source.id).join(", ")}`);
  process.exit(1);
}

await mkdir(DATA_DIR, { recursive: true });
console.log(`Writing raw data to ${DATA_DIR}\n`);

let failures = 0;

await Promise.all(
  selected.map(async ({ id, file, fetch }) => {
    try {
      const result = await fetch();
      if (result instanceof Error) {
        failures++;
        console.error(`✗ ${id}: ${result.message}`);
        return;
      }
      await writeFile(join(DATA_DIR, file), result, "utf8");
      console.log(`✓ ${id} → ${file}`);
    } catch (error) {
      failures++;
      console.error(`✗ ${id}: ${error instanceof Error ? error.message : error}`);
    }
  })
);

if (failures > 0) {
  console.error(`\n${failures} of ${selected.length} source(s) failed`);
  process.exit(1);
}

console.log(`\nFetched ${selected.length} source(s)`);
