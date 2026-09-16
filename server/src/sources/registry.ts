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
  },
  {
    id: "afterlifeos",
    romName: "AfterlifeOS",
    file: "afterlifeos.json",
    select: selectors.devices("devices"),
    name: ["name"],
    brand: ["brand"],
  },
  {
    id: "awakenos",
    romName: "AwakenOS",
    file: "awakenos.json",
    select: selectors.devices("devices"),
    name: ["model"],
    brand: ["vendor"],
  },
  {
    id: "blissroms",
    romName: "BlissROMs",
    file: "blissroms.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    sourceUrl: ["supported_versions[].support_thread"],
  },
  {
    id: "cherishos",
    romName: "CherishOS",
    file: "cherishos.json",
    select: selectors.devices("data"),
    name: ["name"],
    brand: ["brand"],
    sourceUrl: ["downloadUrl"],
  },
  {
    id: "clover",
    romName: "Clover",
    file: "clover.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
  },
  {
    id: "corvusos",
    romName: "CorvusOS",
    file: "corvusos.json",
    select: selectors.grouped(["Rom Generic", "Phh"]),
    name: ["device"],
    sourceUrl: ["download"],
  },
  {
    id: "dotos",
    romName: "dotOS",
    file: "dotos.json",
    select: selectors.grouped(["GSI (Universal Builds)"]),
  },
  {
    id: "droidxui",
    romName: "DroidX-UI",
    file: "droidxui.json",
    select: selectors.array,
    name: ["model"],
    brand: ["vendor"],
  },
  {
    id: "matrixx",
    romName: "Matrixx",
    file: "matrixx.json",
    select: selectors.devices("devices"),
    name: ["model"],
    brand: ["vendor"],
  },
  {
    id: "mistos",
    romName: "MistOS",
    file: "mistos.json",
    select: selectors.devices("devices"),
    name: ["deviceName"],
    brand: ["OEM"],
  },
  {
    id: "paranoidandroid",
    romName: "Paranoid Android",
    file: "paranoidandroid.json",
    select: selectors.devices("devices"),
    name: ["name"],
    brand: ["manufacturer"],
    sourceUrl: ["xda_thread"],
  },
  {
    id: "pixysos",
    romName: "PixysOS",
    file: "pixysos.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    sourceUrl: ["supported_bases[].xda_thread"],
  },
  {
    id: "projectinfinityx",
    romName: "Project Infinity X",
    file: "projectinfinityx.json",
    select: selectors.array,
    name: ["devicemodel"],
    sourceUrl: ["supportgroupurl"],
  },
  {
    id: "projectpixelage",
    romName: "Project PixelAge",
    file: "projectpixelage.json",
    select: selectors.array,
    sourceUrl: ["url"],
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
    parse: createEosParser("eos-v1-s.yml"),
  },
  {
    id: "eos",
    file: "eos-v1-t.yml",
    parse: createEosParser("eos-v1-t.yml"),
  },
  {
    id: "eos",
    file: "eos-a14.yml",
    parse: createEosParser("eos-a14.yml"),
  },
  {
    id: "eos",
    file: "eos-a15.yml",
    parse: createEosParser("eos-a15.yml"),
  },
  {
    id: "eos",
    file: "eos-a16.yml",
    parse: createEosParser("eos-a16.yml"),
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
