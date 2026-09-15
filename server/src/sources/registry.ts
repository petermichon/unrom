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

const configs: DeviceSource[] = [
  {
    id: "pixelexperience",
    romName: "PixelExperience",
    file: "pixelexperience.json",
    select: selectors.array,
    bases: { key: "supported_versions", pick: "version_code" },
  },
  {
    id: "afterlifeos",
    romName: "AfterlifeOS",
    file: "afterlifeos.json",
    select: selectors.devices("devices"),
    name: ["name"],
    brand: ["brand"],
    maintainer: ["maintainer"],
    active: ["status"],
  },
  {
    id: "awakenos",
    romName: "AwakenOS",
    file: "awakenos.json",
    select: selectors.devices("devices"),
    name: ["model"],
    brand: ["vendor"],
    maintainer: ["maintainer_name"],
    active: ["active"],
  },
  {
    id: "blissroms",
    romName: "BlissROMs",
    file: "blissroms.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    maintainer: ["supported_versions[].maintainer_name"],
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
    maintainer: ["maintainer"],
    active: ["status"],
  },
  {
    id: "corvusos",
    romName: "CorvusOS",
    file: "corvusos.json",
    select: selectors.grouped(["Rom Generic", "Phh"]),
    name: ["device"],
    maintainer: ["maintainer"],
    sourceUrl: ["download"],
    defaultActive: false,
  },
  {
    id: "dotos",
    romName: "dotOS",
    file: "dotos.json",
    select: selectors.grouped(["GSI (Universal Builds)"]),
    defaultActive: false,
  },
  {
    id: "droidxui",
    romName: "DroidX-UI",
    file: "droidxui.json",
    select: selectors.array,
    name: ["model"],
    brand: ["vendor"],
    maintainer: ["maintainer"],
    active: ["active"],
  },
  {
    id: "matrixx",
    romName: "Matrixx",
    file: "matrixx.json",
    select: selectors.devices("devices"),
    name: ["model"],
    brand: ["vendor"],
    maintainer: ["maintainer_name"],
    active: ["active"],
  },
  {
    id: "mistos",
    romName: "MistOS",
    file: "mistos.json",
    select: selectors.devices("devices"),
    name: ["deviceName"],
    brand: ["OEM"],
    maintainer: ["maintainer"],
    active: ["enabled"],
  },
  {
    id: "paranoidandroid",
    romName: "Paranoid Android",
    file: "paranoidandroid.json",
    select: selectors.devices("devices"),
    name: ["name"],
    brand: ["manufacturer"],
    maintainer: ["maintainers"],
    sourceUrl: ["xda_thread"],
    active: ["active"],
  },
  {
    id: "pixysos",
    romName: "PixysOS",
    file: "pixysos.json",
    select: selectors.array,
    name: ["name"],
    brand: ["brand"],
    bases: { key: "supported_bases", pick: "name" },
    sourceUrl: ["supported_bases[].xda_thread"],
    defaultActive: false,
  },
  {
    id: "projectinfinityx",
    romName: "Project Infinity X",
    file: "projectinfinityx.json",
    select: selectors.array,
    name: ["devicemodel"],
    maintainer: ["maintainer"],
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

// Sources whose raw shape does not fit the config adapter. /e/OS is split
// across branches and shares one ROM id, so its files are ordered oldest to
// newest — the build keeps the last edge per (rom, device), i.e. the newest
// Android base.
const specialSources: SourceAdapter[] = [
  { id: "pixelos", file: "pixelos.json", parse: parsePixelOS },
  { id: "aicp", file: "aicp.txt", parse: parseAICP },
  { id: "arrowos", file: "arrowos.txt", parse: parseArrowOS },
  { id: "havocos", file: "havocos.txt", parse: parseHavocOS },
  { id: "risingos", file: "risingos.md", parse: parseRisingOS },
  {
    id: "kenvyra",
    file: "kenvyra.json",
    parse: parseKenvyra,
  },
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
    parse: createEosParser("eos-v1-s.yml", "12"),
  },
  {
    id: "eos",
    file: "eos-v1-t.yml",
    parse: createEosParser("eos-v1-t.yml", "13"),
  },
  {
    id: "eos",
    file: "eos-a14.yml",
    parse: createEosParser("eos-a14.yml", "14"),
  },
  {
    id: "eos",
    file: "eos-a15.yml",
    parse: createEosParser("eos-a15.yml", "15"),
  },
  {
    id: "eos",
    file: "eos-a16.yml",
    parse: createEosParser("eos-a16.yml", "16"),
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
