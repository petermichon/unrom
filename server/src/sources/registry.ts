import type { NormalizedRomDevice } from "../normalized.ts";
import { createParser, selectors } from "./adapter.ts";
import type { DeviceSource } from "./adapter.ts";
import { parseAICP } from "./aicp.ts";
import { parseArrowOS } from "./arrowos.ts";
import { createEosParser } from "./eos.ts";
import { parseEvolutionX } from "./evolutionx.ts";
import { parseHavocOS } from "./havocos.ts";
import { parseIode } from "./iode.ts";
import { parseKaliNetHunter } from "./kali-nethunter.ts";
import { parseKenvyra } from "./kenvyra.ts";
import { parseLineageOS } from "./lineageos.ts";
import { parsePixelOS } from "./pixelos.ts";
import { parseRisingOS } from "./risingos.ts";

export interface SourceAdapter {
  id: string;
  file: string;
  parse: (raw: string) => NormalizedRomDevice[];
}

// Sources that may legitimately parse to zero records (e.g. a paused project).
// Everything else failing to parse is treated as breakage.
export const ALLOWED_EMPTY_FILES = new Set<string>();

const configs: DeviceSource[] = [
  {
    id: "pixelexperience",
    romName: "PixelExperience",
    file: "pixelexperience.json",
    select: selectors.array,
    referencePage: "https://download.pixelexperience.org/{codename}",
  },
  {
    id: "afterlifeos",
    romName: "AfterlifeOS",
    file: "afterlifeos.json",
    select: selectors.devices("devices"),
    name: ["name"],
    brand: ["brand"],
    referencePage:
      "https://github.com/AfterlifeOS/device_afterlife_ota/blob/16.2/devices.json",
  },
  {
    id: "awakenos",
    romName: "AwakenOS",
    file: "awakenos.json",
    select: selectors.devices("devices"),
    name: ["model"],
    brand: ["vendor"],
    referencePage:
      "https://github.com/Project-Awaken/official_devices/blob/ursa/devices.json",
  },
  {
    id: "blissroms",
    romName: "BlissROMs",
    file: "blissroms.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    referenceUrl: ["supported_versions[].support_thread"],
  },
  {
    id: "cherishos",
    romName: "CherishOS",
    file: "cherishos.json",
    select: selectors.devices("data"),
    name: ["name"],
    brand: ["brand"],
    referenceUrl: ["downloadUrl"],
  },
  {
    id: "clover",
    romName: "Clover",
    file: "clover.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    referencePage: "https://thecloverproject.com/download?device={codename}",
  },
  {
    id: "corvusos",
    romName: "CorvusOS",
    file: "corvusos.json",
    select: selectors.grouped(["Rom Generic", "Phh"]),
    name: ["device"],
    referenceUrl: ["download"],
  },
  {
    id: "dotos",
    romName: "dotOS",
    file: "dotos.json",
    select: selectors.grouped(["GSI (Universal Builds)"]),
    referencePage: "https://www.droidontime.com/devices/{codename}",
  },
  {
    id: "droidxui",
    romName: "DroidX-UI",
    file: "droidxui.json",
    select: selectors.array,
    name: ["model"],
    brand: ["vendor"],
    referencePage:
      "https://github.com/DroidX-UI-Devices/vendor_droidxOTA/blob/15/devices.json",
  },
  {
    id: "matrixx",
    romName: "Matrixx",
    file: "matrixx.json",
    select: selectors.devices("devices"),
    name: ["model"],
    brand: ["vendor"],
    referencePage:
      "https://github.com/Matrixx-Devices/official_devices/blob/16.0/devices.json",
  },
  {
    id: "mistos",
    romName: "MistOS",
    file: "mistos.json",
    select: selectors.devices("devices"),
    name: ["deviceName"],
    brand: ["OEM"],
    referencePage:
      "https://github.com/MistOS-Devices/official_devices/blob/16.2/buildDevices.json",
  },
  {
    id: "paranoidandroid",
    romName: "Paranoid Android",
    file: "paranoidandroid.json",
    select: selectors.devices("devices"),
    name: ["name"],
    brand: ["manufacturer"],
    referenceUrl: ["xda_thread"],
    referencePage: "https://github.com/AOSPA/ota/blob/master/devices",
  },
  {
    id: "pixysos",
    romName: "PixysOS",
    file: "pixysos.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    referenceUrl: ["supported_bases[].xda_thread"],
    referencePage: "https://pixysos.com/{codename}",
  },
  {
    id: "projectinfinityx",
    romName: "Project Infinity X",
    file: "projectinfinityx.json",
    select: selectors.array,
    name: ["devicemodel"],
    referenceUrl: ["supportgroupurl"],
    referencePage: "https://projectinfinity-x.com/downloads/{codename}",
  },
  {
    id: "projectpixelage",
    romName: "Project PixelAge",
    file: "projectpixelage.json",
    select: selectors.array,
    referenceUrl: ["url"],
  },
];

// Sources whose raw shape does not fit the config adapter.
const specialSources: SourceAdapter[] = [
  { id: "pixelos", file: "pixelos.json", parse: parsePixelOS },
  { id: "aicp", file: "aicp.txt", parse: parseAICP },
  { id: "arrowos", file: "arrowos.txt", parse: parseArrowOS },
  { id: "havocos", file: "havocos.txt", parse: parseHavocOS },
  { id: "risingos", file: "risingos.md", parse: parseRisingOS },
  { id: "kenvyra", file: "kenvyra.json", parse: parseKenvyra },
  {
    id: "kali-nethunter",
    file: "kali-nethunter.yml",
    parse: parseKaliNetHunter,
  },
  { id: "lineageos", file: "lineageos.json", parse: parseLineageOS },
  { id: "evolutionx", file: "evolutionx.json", parse: parseEvolutionX },
  { id: "iode", file: "iode.json", parse: parseIode },
  {
    id: "eos",
    file: "eos-v1-s.yml",
    parse: createEosParser(),
  },
  {
    id: "eos",
    file: "eos-v1-t.yml",
    parse: createEosParser(),
  },
  {
    id: "eos",
    file: "eos-a14.yml",
    parse: createEosParser(),
  },
  {
    id: "eos",
    file: "eos-a15.yml",
    parse: createEosParser(),
  },
  {
    id: "eos",
    file: "eos-a16.yml",
    parse: createEosParser(),
  },
];

export const sources: SourceAdapter[] = [
  ...specialSources,
  ...configs.map((config) => ({
    id: config.id,
    file: config.file,
    parse: createParser(config),
  })),
];
