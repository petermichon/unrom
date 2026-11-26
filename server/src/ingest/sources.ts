// The registry of ingest sources: one entry per upstream document the pipeline
// fetches. It lives apart from the fetch loop so the health check can name every
// source without running it. Register new fetchers here.

import { listDevices as listAfterlifeOS } from "./fetch/afterlifeos.ts";
import { listDevices as listAICP } from "./fetch/aicp.ts";
import {
  listDevices as listAlphaDroid,
  listSiteDevices as listAlphaDroidSite,
} from "./fetch/alphadroid.ts";
import { listDevices as listCalyxOS } from "./fetch/calyxos.ts";
import { listDevices as listArrowOS } from "./fetch/arrowos.ts";
import { listDevices as listAospExtended } from "./fetch/aospextended.ts";
import { listDevices as listAwakenOS } from "./fetch/awakenos.ts";
import { listDevices as listAxpOs } from "./fetch/axp-os.ts";
import { listDevices as listAxionOs } from "./fetch/axionos.ts";
import { listDevices as listBlissROMs } from "./fetch/blissroms.ts";
import { listDevices as listCandyRoms } from "./fetch/candyroms.ts";
import { listDevices as listCherishOS } from "./fetch/cherishos.ts";
import { listDevices as listClover } from "./fetch/clover.ts";
import { listDevices as listCorvusOS } from "./fetch/corvusos.ts";
import { listDevices as listCrDroid } from "./fetch/crdroid.ts";
import { listDevices as listDerpFest } from "./fetch/derpfest.ts";
import { listDevices as listDotOS } from "./fetch/dotos.ts";
import { listDevices as listDroidXUI } from "./fetch/droidxui.ts";
import { listDevices as listBlackIron } from "./fetch/blackiron.ts";
import { listDevices as listCatalyst } from "./fetch/catalyst.ts";
import { listDevices as listCarbon } from "./fetch/carbon.ts";
import { listDevices as listCipheros } from "./fetch/cipheros.ts";
import { listDevices as listVoltageOs } from "./fetch/voltageos.ts";
import { listDevices as listKraken } from "./fetch/kraken.ts";
import { listDevices as listLighthouse } from "./fetch/lighthouse.ts";
import { listDevices as listPalladium } from "./fetch/palladium.ts";
import { listDevices as listPixelStar } from "./fetch/pixelstar.ts";
import { listDevices as listProjectBlaze } from "./fetch/project-blaze.ts";
import { listDevices as listSomethingOS } from "./fetch/somethingos.ts";
import { listDevices as listTequila } from "./fetch/tequila.ts";
import { listDevices as listAimRom } from "./fetch/aim-rom.ts";
import { listDevices as listAosip } from "./fetch/aosip.ts";
import { listDevices as listFreakyOs } from "./fetch/freaky-os.ts";
import { listDevices as listReloadedOs } from "./fetch/reloadedos.ts";
import { listDevices as listSlimRoms } from "./fetch/slimroms.ts";
import { listDevices as listWaveOs } from "./fetch/waveos.ts";
import { listDevices as listZeusOs } from "./fetch/zeusos.ts";
import { listDevices as listSparkOS } from "./fetch/sparkos.ts";
import { listDevices as listYaap } from "./fetch/yaap.ts";
import {
  listDevices as list2by2,
  listLegacyDevices as list2by2Legacy,
} from "./fetch/2by2.ts";
import { listDevices as listEtherealOS } from "./fetch/etherealos.ts";
import { listDevices as listGenesisOS } from "./fetch/genesisos.ts";
import { listDevices as listProjectSakura } from "./fetch/project-sakura.ts";
import { listDevices as listWitAqua } from "./fetch/witaqua.ts";
// /e/OS: its GitLab releases repo is no longer publicly readable, so the
// `eos-*.yml` snapshots are frozen; the live source is the official devices page.
import { listDevices as listEos } from "./fetch/eos.ts";
import { listDevices as listEvolutionX } from "./fetch/evolutionx.ts";
import { listDevices as listGrapheneOS } from "./fetch/grapheneos.ts";
import { listDevices as listHavocOS } from "./fetch/havocos.ts";
import {
  listDevices as listIode,
  listSupportedDevices as listIodeSupported,
} from "./fetch/iode.ts";
import { listDevices as listKaliNetHunter } from "./fetch/kali-nethunter.ts";
import { listDevices as listKenvyra } from "./fetch/kenvyra.ts";
import { listDevices as listLineageOS } from "./fetch/lineageos.ts";
import { listDevices as listLineageOSMicroG } from "./fetch/lineageos-microg.ts";
import { listDevices as listLunaris } from "./fetch/lunaris.ts";
import { listDevices as listMatrixx } from "./fetch/matrixx.ts";
import { listDevices as listMistOS } from "./fetch/mistos.ts";
import {
  listAospDevices as listNamelessAosp,
  listCloDevices as listNamelessClo,
} from "./fetch/nameless-aosp.ts";
import { listDevices as listParanoidAndroid } from "./fetch/paranoidandroid.ts";
import { listDevices as listPixelExtended } from "./fetch/pixelextended.ts";
import { listDevices as listPixelExperience } from "./fetch/pixelexperience.ts";
import { listDevices as listPixelOS } from "./fetch/pixelos.ts";
import { listDevices as listPlayDevices } from "./fetch/play.ts";
import { listDevices as listProjectInfinityX } from "./fetch/projectinfinityx.ts";
import { listDevices as listPixysOS } from "./fetch/pixysos.ts";
import { listDevices as listProjectPixelAge } from "./fetch/projectpixelage.ts";
import { listDevices as listRisingOS } from "./fetch/risingos.ts";
import { listDevices as listSuperiorOS } from "./fetch/superioros.ts";
type DeviceList = () => Promise<string | Error>;

export interface Source {
  id: string;
  file: string;
  fetch: DeviceList;
}

export const sources: Source[] = [
  { id: "afterlifeos", file: "afterlifeos.json", fetch: listAfterlifeOS },
  { id: "aicp", file: "aicp.txt", fetch: listAICP },
  { id: "alphadroid", file: "alphadroid.md", fetch: listAlphaDroid },
  { id: "alphadroid", file: "alphadroid.json", fetch: listAlphaDroidSite },
  { id: "calyxos", file: "calyxos.html", fetch: listCalyxOS },
  { id: "arrowos", file: "arrowos.txt", fetch: listArrowOS },
  { id: "aospextended", file: "aospextended.json", fetch: listAospExtended },
  { id: "awakenos", file: "awakenos.json", fetch: listAwakenOS },
  { id: "axp-os", file: "axp-os.json", fetch: listAxpOs },
  { id: "axionaosp", file: "axionos.json", fetch: listAxionOs },
  { id: "blissroms", file: "blissroms.json", fetch: listBlissROMs },
  { id: "candyroms", file: "candyroms.json", fetch: listCandyRoms },
  { id: "cherishos", file: "cherishos.json", fetch: listCherishOS },
  { id: "clover", file: "clover.json", fetch: listClover },
  { id: "corvusos", file: "corvusos.json", fetch: listCorvusOS },
  { id: "crdroid", file: "crdroid.json", fetch: listCrDroid },
  { id: "derpfest", file: "derpfest.json", fetch: listDerpFest },
  { id: "dotos", file: "dotos.json", fetch: listDotOS },
  { id: "droidxui", file: "droidxui.json", fetch: listDroidXUI },
  { id: "black-iron-project", file: "blackiron.json", fetch: listBlackIron },
  { id: "sparkos", file: "sparkos.html", fetch: listSparkOS },
  { id: "yaap-aosp", file: "yaap.json", fetch: listYaap },
  { id: "project-blaze", file: "projectblaze.json", fetch: listProjectBlaze },
  { id: "pixelstar", file: "pixelstar.json", fetch: listPixelStar },
  { id: "tequila-os", file: "tequila.json", fetch: listTequila },
  { id: "aim-rom", file: "aim-rom.json", fetch: listAimRom },
  { id: "aosip", file: "aosip.json", fetch: listAosip },
  { id: "freaky-os", file: "freaky-os.json", fetch: listFreakyOs },
  { id: "reloadedos", file: "reloadedos.json", fetch: listReloadedOs },
  { id: "slimroms", file: "slimroms.json", fetch: listSlimRoms },
  { id: "waveos", file: "waveos.json", fetch: listWaveOs },
  { id: "zeusos", file: "zeusos.json", fetch: listZeusOs },
  { id: "somethingos", file: "somethingos.json", fetch: listSomethingOS },
  { id: "the-kraken-project", file: "kraken.json", fetch: listKraken },
  { id: "project-lighthouse", file: "lighthouse.json", fetch: listLighthouse },
  { id: "palladiumos", file: "palladium.json", fetch: listPalladium },
  { id: "catalystos", file: "catalyst.json", fetch: listCatalyst },
  { id: "carbon-rom", file: "carbon.html", fetch: listCarbon },
  { id: "cipheros", file: "cipheros.html", fetch: listCipheros },
  { id: "voltageos", file: "voltageos.json", fetch: listVoltageOs },
  { id: "2by2-project", file: "2by2.json", fetch: list2by2 },
  { id: "2by2-project", file: "2by2-legacy.json", fetch: list2by2Legacy },
  { id: "etherealos", file: "etherealos.json", fetch: listEtherealOS },
  { id: "genesisos", file: "genesisos.json", fetch: listGenesisOS },
  { id: "project-sakura", file: "sakura.json", fetch: listProjectSakura },
  { id: "witaqua", file: "witaqua.json", fetch: listWitAqua },
  { id: "eos", file: "eos.json", fetch: listEos },
  { id: "evolutionx", file: "evolutionx.json", fetch: listEvolutionX },
  { id: "grapheneos", file: "grapheneos.json", fetch: listGrapheneOS },
  { id: "havocos", file: "havocos.txt", fetch: listHavocOS },
  { id: "iode", file: "iode.json", fetch: listIode },
  { id: "iode", file: "iode.html", fetch: listIodeSupported },
  {
    id: "kali-nethunter",
    file: "kali-nethunter.yml",
    fetch: listKaliNetHunter,
  },
  { id: "kenvyra", file: "kenvyra.json", fetch: listKenvyra },
  { id: "lineageos", file: "lineageos.json", fetch: listLineageOS },
  {
    id: "lineageos-microg",
    file: "lineageos-microg.html",
    fetch: listLineageOSMicroG,
  },
  { id: "lunaris", file: "lunaris.json", fetch: listLunaris },
  { id: "matrixx", file: "matrixx.json", fetch: listMatrixx },
  { id: "mistos", file: "mistos.json", fetch: listMistOS },
  { id: "nameless-aosp", file: "nameless-aosp.html", fetch: listNamelessAosp },
  { id: "nameless-aosp", file: "nameless-clo.html", fetch: listNamelessClo },
  {
    id: "paranoidandroid",
    file: "paranoidandroid.json",
    fetch: listParanoidAndroid,
  },
  {
    id: "pixelextended",
    file: "pixelextended.json",
    fetch: listPixelExtended,
  },
  {
    id: "pixelexperience",
    file: "pixelexperience.json",
    fetch: listPixelExperience,
  },
  { id: "pixelos", file: "pixelos.json", fetch: listPixelOS },
  {
    id: "play-devices",
    file: "play-devices.csv",
    fetch: listPlayDevices,
  },
  { id: "pixysos", file: "pixysos.json", fetch: listPixysOS },
  {
    id: "projectinfinityx",
    file: "projectinfinityx.json",
    fetch: listProjectInfinityX,
  },
  {
    id: "projectpixelage",
    file: "projectpixelage.json",
    fetch: listProjectPixelAge,
  },
  { id: "risingos", file: "risingos.md", fetch: listRisingOS },
  { id: "superioros", file: "superioros.json", fetch: listSuperiorOS },
];
