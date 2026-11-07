# Attribution

unrom is a compilation of device ↔ ROM compatibility data collected from public
sources. The raw snapshots in `data/` remain the property of their respective
projects and are used under their own terms; unrom's compilation and derived
exports are licensed under [ODbL-1.0](./DATA_LICENSE). ROM and device names are
the trademarks of their respective owners.

If you maintain one of these projects and want a correction or removal, please
open an issue.

| ROM                  | Data source                        | Upstream                                                                    |
| -------------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| AfterlifeOS          | `devices.json`                     | https://github.com/AfterlifeOS/device_afterlife_ota                         |
| AICP                 | `aicp-build-targets`               | https://github.com/AICP/vendor_jenkins                                      |
| AlphaDroid           | `data/devices.json` + `devices.md` | https://alphadroid.org                                                      |
| AospExtended         | `devices.json`                     | https://github.com/AospExtended/official_devices                            |
| ArrowOS              | `arrow.devices`                    | https://github.com/ArrowOS/arrow_infrastructure_devices                     |
| AwakenOS             | `devices.json`                     | https://github.com/Project-Awaken/official_devices                          |
| AxionOS              | `api/downloads.json`               | https://github.com/AxionAOSP/official_devices                               |
| AXP.OS               | sitemap                            | https://axpos.org/sitemap.xml                                               |
| BlissROMs            | `devices.json`                     | https://github.com/BlissRoms-Devices/official-devices                       |
| CalyxOS              | install page                       | https://calyxos.org/install/                                                |
| CandyRoms            | `devices.json`                     | https://github.com/CandyRoms/official_devices                               |
| CherishOS            | `/api/devices`                     | https://www.cherishos.com                                                   |
| Clover               | `devices.json`                     | https://github.com/The-Clover-Project/TheCloverProject.com                  |
| CorvusOS             | `devices.json`                     | https://github.com/CorvusRom-Devices/jenkins                                |
| crDroid              | OTA `<codename>.json`              | https://github.com/crdroidandroid/android_vendor_crDroidOTA                 |
| DerpFest             | `devices-index.json`               | https://derpfest.org (from DerpFest-AOSP/Updater-Stuff)                     |
| dotOS                | `devices.json`                     | https://github.com/DotOS/official_devices                                   |
| DroidX-UI            | `devices.json`                     | https://github.com/DroidX-UI-Devices/vendor_droidxOTA                       |
| /e/OS                | official devices page              | https://doc.e.foundation/devices                                            |
| Evolution X          | OTA `builds/`                      | https://github.com/Evolution-X/OTA                                          |
| GrapheneOS           | FAQ device list                    | https://grapheneos.org/faq#supported-devices                                |
| Havoc-OS             | `devices`                          | https://github.com/Havoc-OS/Devices                                         |
| iodéOS               | supported-devices page             | https://iode.tech/iodeos-official-supported-devices                         |
| Kali NetHunter       | `devices.yml`                      | https://gitlab.com/kalilinux/nethunter/build-scripts/kali-nethunter-kernels |
| Kenvyra              | `src/devices`                      | https://github.com/Kenvyra/website                                          |
| LineageOS            | `lineage_wiki` devices             | https://github.com/LineageOS/lineage_wiki                                   |
| LineageOS for microG | build-host index                   | https://download.lineage.microg.org                                         |
| Lunaris AOSP         | OTA `builds/*.json`                | https://github.com/Lunaris-AOSP/OTA                                         |
| Project Matrixx      | `devices.json`                     | https://github.com/Matrixx-Devices/official_devices                         |
| MistOS               | `buildDevices.json`                | https://github.com/MistOS-Devices/official_devices                          |
| Nameless AOSP        | SourceForge listings               | https://sourceforge.net/projects/nameless-aosp/files/                       |
| Paranoid Android     | `devices`                          | https://github.com/AOSPA/ota                                                |
| PixelExtended        | OTA `builds/*.json`                | https://github.com/PixelExtended/OTA                                        |
| PixelExperience      | `devices.json`                     | https://github.com/PixelExperience/official_devices                         |
| PixelOS              | `devices.json` (17)                | https://github.com/PixelOS-AOSP/official_devices                            |
| PixysOS              | `devices.json`                     | https://github.com/PixysOS/official_devices                                 |
| Project Infinity X   | `devices.json` (16+17)             | https://github.com/ProjectInfinity-X                                        |
| Project PixelAge     | OTA `devices/`                     | https://github.com/ProjectPixelage/pixelage_ota                             |
| RisingOS             | `devices.md`                       | https://github.com/RisingOS-Revived/official_devices                        |
| SuperiorOS           | OTA `*.json`                       | https://github.com/SuperiorOS-Devices/official_devices                      |

## Device catalogues

The device catalogue is larger than the ROM rosters, so it is built from a
separate source. These snapshots identify devices independent of ROM support;
they are not ROM compatibility data.

| Catalogue                  | Snapshot           | Upstream                                             |
| -------------------------- | ------------------ | ---------------------------------------------------- |
| Google Play supported list | `play-devices.csv` | https://support.google.com/googleplay/answer/1727131 |
| Customrombay device list   | manual cross-check | https://github.com/Customrombay/database             |

Google's list is used as an upstream reference under Google's terms; it is not
relicensed here. Brand and model names remain the trademarks of their owners.
