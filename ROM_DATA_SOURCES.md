# ROM Data Sources

This file tracks the data collection status for various custom Android ROMs.

> Status here is a research snapshot. The **authoritative** list is
> `server/src/ingest/fetch-all.ts` (fetchers) and `server/src/sources/registry.ts`
> (normalizers); upstream attribution lives in `ATTRIBUTION.md`.

## Inclusion Criteria

1. **Installable** - Can be flashed to replace stock ROM
2. **Has device data** - Some form of device list exists

## ROMs

### Implemented

| ROM                | Base | Project Status | Data Source   | Notes                                                                                                                                                        |
| ------------------ | ---- | -------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AICP               | AOSP | ✅ Active      | ✅ GitHub     | Build targets file with device codenames; ~12 active devices on Android 16 (w16.0 branch)                                                                    |
| AfterlifeOS        | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 20+ devices on Android 16                                                                                                      |
| ArrowOS            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Data from March 2024 (2+ years old), but project shows some recent activity (Sept 2025)                                                                      |
| AwakenOS           | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 15 devices across Xiaomi, Redmi, OnePlus, realme, Motorola                                                                     |
| BlissROMs          | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                                                                              |
| CherishOS          | AOSP | ✅ Active      | ✅ API        | API endpoint with 16 devices, last updated Dec 2025; includes recent devices like Xiaomi 13, OnePlus 13                                                      |
| Clover             | AOSP | ✅ Active      | ✅ API        | Single devices.json file with 19 devices across Poco, Motorola, Nothing, Realme, Redmi, Xiaomi; on Android 16                                                |
| CorvusOS           | AOSP | ⚠️ Unclear     | ✅ GitHub     | Single devices.json file with 15+ devices; last builds Nov 2022 (vT5.1, Android 13), project appears inactive                                                |
| crDroid            | AOSP | ✅ Active      | ✅ GitHub API | Unions every version branch of the official OTA repo (Android 10–16); 302 devices matching crdroid.net                                                       |
| DerpFest           | AOSP | ✅ Active      | ✅ API        | Device index `derpfest.org/devices-index.json` (134 devices) with display names + latest build; download hosts vary                                          |
| DroidX-UI          | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 20+ devices across Xiaomi, Nothing, Google, Samsung; last updated July 2025                                                    |
| dotOS              | AOSP | ⚠️ Unclear     | ✅ GitHub     | Last commit Sept 2022, stuck on Android 12; July 2022 announcement about restarting but no activity since                                                    |
| /e/OS              | AOSP | ✅ Active      | ⚠️ GitLab     | **Frozen**: the GitLab releases repo is no longer publicly readable; committed snapshots are still normalized                                                |
| Evolution X        | AOSP | ✅ Active      | ✅ GitHub API | Per-device JSON unioned across release branches (`cnb`/`bka`/`vic`/`udc`); 143 devices; site lists 3 more (`berlin`/`enchilada`/`fajita`) with no build JSON |
| HavocOS            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Data from Sept 2023 (3 years old); HavocOS Revived exists but has no device tracking                                                                         |
| iodéOS             | AOSP | ✅ Active      | ✅ GitLab API | Device directories in GitLab repository tree; fetched via GitLab API                                                                                         |
| Kali NetHunter     | AOSP | ✅ Active      | ✅ GitLab     | Device kernels YAML with detailed device information and Android versions                                                                                    |
| Kenvyra            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Device data in Markdown files with YAML frontmatter; 4 devices                                                                                               |
| LineageOS          | AOSP | ✅ Active      | ✅ GitHub API | Device list via GitHub API, actively maintained with wide device support                                                                                     |
| Lunaris AOSP       | AOSP | ✅ Active      | ✅ GitHub     | Per-device OTA JSON in `builds/` (45 devices, Android 16.2); active, builds through Sept 2026                                                                |
| Matrixx            | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 30+ devices across Xiaomi, POCO, OnePlus                                                                                       |
| MistOS             | AOSP | ✅ Active      | ✅ GitHub     | Single buildDevices.json file with 25+ devices on Android 16                                                                                                 |
| Paranoid Android   | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                                                                              |
| PixelExtended      | AOSP | ⚠️ Unclear     | ✅ GitHub     | Per-device OTA JSON in `builds/` (20 devices); stalled on Android 13, last builds 2023                                                                       |
| PixelExperience    | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                                                                              |
| PixelOS            | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                                                                              |
| PixysOS            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Core repos last updated July 2024 (2 years old); devices list may be outdated                                                                                |
| Project Infinity X | AOSP | ✅ Active      | ✅ GitHub API | Individual device JSON files via GitHub API; fetched with a two-stage fetch                                                                                  |
| Project PixelAge   | AOSP | ✅ Active      | ✅ GitHub API | Individual device JSON files via GitHub API; 15 devices on Android 15, A16 WIP                                                                               |
| RisingOS           | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                                                                              |

### Not Implemented

| ROM                         | Base | Project Status  | Data Source | Notes                                                                                                                                   |
| --------------------------- | ---- | --------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 2by2 Project                | AOSP | ✅ Active       | ✅ GitHub   | Machine-readable devices.json (2 devices, Android 16); small but implementable                                                          |
| AIM ROM                     | AOSP | ❌ Discontinued | ⚠️ GitHub   | Official device XMLs archived Apr 2020 (~30 devices); core repos last active Nov 2022; site frozen at 2020                              |
| AlphaDroid                  | AOSP | ✅ Active       | ⚠️ GitHub   | 100+ individual device JSON files in OTA repository; requires fetching many files                                                       |
| AlrightOS                   | AOSP | ❌ Discontinued | ❌ No data  | LineageOS fork; alrightos.xyz domain parked; no machine-readable device list                                                            |
| AmogOS Rom                  | AOSP | ⚠️ Unclear      | ❌ No data  | LMOdroid-based; repos last active Dec 2024; no official device list                                                                     |
| AmyROM                      | AOSP | ⚠️ Unclear      | ❌ No data  | LineageOS fork; amyrom.ml no longer resolves; no device list                                                                            |
| AncientOS                   | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Single website_api.json file with 70+ devices; data from 2022, last repo update Sept 2023                                               |
| AOKP                        | AOSP | ❌ Discontinued | ⚠️ Website  | Discontinued after Android 9 (2020); repos inactive since 2022; aokp.co TLS broken; no maintained device roster                         |
| AOSDP                       | AOSP | ❌ Discontinued | ⚠️ Website  | AOSP-based dark-theme ROM; core GitHub repos last touched 2019, downloads site Aug 2024, no JSON device list.                           |
| AOSiP                       | AOSP | ❌ Discontinued | ✅ API      | AOSP ROM; devices.json lists ~33 codenames, but code froze 2022 and aosip.dev last updated Jan 2023.                                    |
| AospExtended                | AOSP | ❌ Discontinued | ⚠️ GitHub   | Suspended indefinitely August 2022; individual device repositories, no centralized device list                                          |
| Aquari OS                   | AOSP | ❌ Discontinued | ❌ No data  | GitHub org marked "PROJECT NO LONGER ACTIVE"; last builds ~2020 (Android 10); no device list                                            |
| ArfoxOS                     | AOSP | ⚠️ Unclear      | ❌ No data  | New org (2025); LineageOS-based; OTA repo empty, no published device list                                                               |
| Atomic OS                   | AOSP | ❌ Discontinued | ⚠️ GitHub   | XDA threads marked discontinued; last builds 2018 (Android 8.1); individual device repos                                                |
| AuroraDroid                 | AOSP | ⚠️ Unclear      | ❌ No data  | LineageOS-based v2, repos active Oct 2025; no published device list                                                                     |
| AXP.OS                      | AOSP | ✅ Active       | ⚠️ Website  | Device list on website; main sources require login; no machine-readable data source (15+ devices)                                       |
| BaikalOS                    | AOSP | ✅ Active       | ⚠️ Website  | crDroid 16.0 rebrand; branches through Sept 2026; downloads on SourceForge, no machine-readable device list                             |
| BananaDroid                 | AOSP | ❌ Discontinued | ⚠️ GitHub   | bananadroid.com domain for sale; official_devices repo last updated Mar 2024                                                            |
| BeastROMs                   | AOSP | ❌ Discontinued | ⚠️ GitHub   | Last builds Aug 2019 (Android 9); per-device repos only, no centralized list                                                            |
| Benzo ROM                   | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Repos last updated May 2023; Pixel device trees only, no centralized device list                                                        |
| Bianca Project              | AOSP | ❌ Discontinued | ❌ No data  | AOSP/Proton-derived; GitHub org dormant since Dec 2023, no device list or OTA metadata published.                                       |
| Black Iron Project          | AOSP | ✅ Active       | ⚠️ GitHub   | LineageOS-based; actively commits May 2026 and emits per-device JSON (e.g. lemonade.json) under OTA/builds.                             |
| Bootleggers ROM             | AOSP | ❌ Discontinued | ✅ GitHub   | AOSP (android-13.0.0_r43); code frozen 2023, site Aug 2024; devices.json generated from `_devices` front matter.                        |
| BsdkOS                      | AOSP | ❌ Discontinued | ❌ No data  | AOSP fork (Project-Fluid base); org dormant since Nov 2021, no device list or OTA data published.                                       |
| CAF Extended                | AOSP | ❌ Discontinued | ❌ No data  | AOSP+Qualcomm CAF build; last commits Jan–Mar 2022, no machine-readable device list found.                                              |
| CalyxOS                     | AOSP | ✅ Active       | ⚠️ Website  | Device list on website, includes latest Pixel 9 series and 2024 Motorola devices, requires web scraping                                 |
| CandyRoms                   | AOSP | ❌ Discontinued | ❌ No data  | AOSP-based; vendor_candy last updated Jul 2024; candyroms.org is now a parked search domain, no device data.                            |
| Carbon ROM                  | AOSP | ✅ Active       | ⚠️ Website  | AOSP-based; builds dated May 2026 on get.carbonrom.org, but device list is only per-device HTML pages.                                  |
| CatalystOS                  | AOSP | ❌ Discontinued | ⚠️ GitHub   | AOSP-based; code frozen 2023, but OTA repo still publishes devices.json with codenames.                                                 |
| Cesium OS                   | AOSP | ❌ Discontinued | ⚠️ Website  | AOSP-based; GitHub org dormant since Jan 2023, device list only on the static website, no JSON.                                         |
| CipherOS                    | AOSP | ✅ Active       | ⚠️ Website  | AOSP-based, actively committing Dec 2025; current 20-device list only on cipheros.org.in, repo JSON is stale.                           |
| Citrus CAF                  | AOSP | ❌ Discontinued | ❌ No data  | Org dormant; most repos last touched 2019, latest 2022; only manifest XML, no devices.json/OTA list.                                    |
| ClownUI                     | AOSP | ⚠️ Unclear      | ❌ No data  | Org bio says "Based on AOSP, WIP"; last commits Dec 2024; no official-devices repo or list.                                             |
| ColtOS                      | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Rebranded as Colt-Enigma; device builds on Android 11 from 2021; individual device JSON files                                           |
| ConquerOS                   | AOSP | ❌ Discontinued | ❌ No data  | Org archived Apr 2024, last commits Jan 2024; docs/devices/devices.md lists devices but not machine-readable.                           |
| Cosmic OS                   | AOSP | ❌ Discontinued | ⚠️ Website  | GitHub last activity Apr 2023; site ©2018 Android 8.1; cosmic-os.github.io/devices.html HTML only.                                      |
| CyanogenMod                 | AOSP | ❌ Discontinued | ⚠️ Website  | Officially shut down December 2016 (10 years ago); succeeded by LineageOS (already implemented)                                         |
| Cygnus ROM                  | AOSP | ❌ Discontinued | ⚠️ Website  | Last commits May 2023 on caf-13; cygnusos.com/downloadpage.html lists ~10 devices as HTML only.                                         |
| Cypher OS                   | AOSP | ❌ Discontinued | ❌ No data  | Last commits 2019–2022; cypheros.co; no machine-readable device list found.                                                             |
| Descendant X                | AOSP | ❌ Discontinued | ❌ No data  | Generic Treble GSI (no per-device list); last commit Sep 25 2020; only manifest/bug_tracker.                                            |
| Dirty Unicorns              | AOSP | ❌ Discontinued | ❌ No data  | Shut down Mar 2021; repos last touched 2022; dirtyunicorns.com now expired/parked.                                                      |
| DivestOS                    | AOSP | ❌ Discontinued | ⚠️ GitHub   | Mobile OS discontinued December 2024; device data in shell script arrays (~170 devices), complex parsing                                |
| EliteRoms                   | MIUI | ✅ Active       | ⚠️ Website  | v4.09 HyperOS 3.1 A16 releases Sep 2026; linked github.com/elite is unrelated; real site elitedevelopment.com.pk + Telegram.            |
| ElytraOS                    | AOSP | ⚠️ Unclear      | ❌ No data  | Last commits Jun 2024; only individual device trees (e.g. device_xiaomi_vayu), no devices.json.                                         |
| Eternity OS                 | AOSP | ⚠️ Unclear      | ❌ No data  | github.com/EternityOS-Plus-Tiramisu returns 404; no verifiable 2026 activity or device list.                                            |
| EtherealOS                  | AOSP | ✅ Active       | ✅ GitHub   | Manifest/.github commits Jan 2026; Ethereal-Devices repo publishes devices.json (A13): https://github.com/Ethereal-OS/Ethereal-Devices. |
| euclidOS                    | AOSP | ✅ Active       | ✅ GitHub   | Old euclidTeam org archived Jan 2026, source moved to euclidOS-AOSP (commits to Jun 2026); devices.json maintained.                     |
| EunoiaOS                    | AOSP | ✅ Active       | ❌ No data  | Repos updated Aug 2026; manifest forks LineageOS lineage-23.2; no public device list found.                                             |
| Evervolv                    | AOSP | ⚠️ Unclear      | ⚠️ Website  | AOSP mirror repos updated Nov 2025 on v-15.2 (A15) branch, but device builds on site date to ~2021.                                     |
| ExTHmUI                     | AOSP | ❌ Discontinued | ❌ No data  | Main manifest last updated Sep 2024; exthmui-next code stops Dec 2024; exthmui.cn deprecated; solo maintainer.                          |
| FireHound                   | AOSP | ❌ Discontinued | ⚠️ Website  | Last repos Nov 2021; Lineage-based (LineageParts/lineage-sdk); only a 2017 website, no device list.                                     |
| Flamingo OS                 | AOSP | ❌ Discontinued | ❌ No data  | All repos last updated 25 Dec 2022; org states a CLO base; no device list published.                                                    |
| Floko ROM                   | AOSP | ❌ Discontinued | ⚠️ Website  | Patch README builds from crDroid android 13.0; repo archived Apr 2025; site claims AOSP but base is crDroid.                            |
| Fluid OS                    | AOSP | ❌ Discontinued | ❌ No data  | Manifest repo is literally marked DISCONTINUED; last commits Aug 2022; no device list.                                                  |
| Fork LineageOS              | AOSP | ❌ Discontinued | ❌ No data  | Self-described LineageOS fork by HyperTeam; last code Jul 2024; no official_devices repo.                                               |
| fortuneOS                   | AOSP | ❌ Discontinued | ❌ No data  | AOSP org last commit Dec 2024; successor FortuneOS-CAF (CLO) last active Apr 2025; no device JSON.                                      |
| Freaky OS                   | AOSP | ❌ Discontinued | ❌ No data  | Manifest last commit Dec 2020 (Android R); site last touched Apr 2023; no device list.                                                  |
| Fusion OS                   | AOSP | ❌ Discontinued | ⚠️ Website  | Source last updated Feb 2024; official_devices offers only a human-readable devices.md list.                                            |
| GenesisOS                   | AOSP | ✅ Active       | ✅ GitHub   | AOSP; org commits May 2026, v4.4 Verve A15 QPR2; JSON roster of 16 codenames.                                                           |
| GhostOS                     | AOSP | ❌ Discontinued | ❌ No data  | AOSP/PixelExperience fork; GitHub org tagged "(EOL)", repos last updated Jul 2022.                                                      |
| GrapheneOS                  | AOSP | ✅ Active       | ⚠️ Website  | Device list on website, includes latest Pixel 10 series, requires web scraping                                                          |
| Halcyon Project             | AOSP | ✅ Active       | ⚠️ Website  | AOSP; commits Sep 2026, Android 16 Bloom (16.2 in dev); devices documented only on wiki.                                                |
| Halogen OS                  | AOSP | ✅ Active       | ⚠️ Website  | AOSP; XOS-16.2 releases Jun 2026 for Nothing Pong/Spacewar; no device-list JSON.                                                        |
| HentaiOS                    | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | AOSP/helluvaOS; last A15 "Vallhound"; officialDevices TOML last commit Jun 2025.                                                        |
| HyconOS                     | AOSP | ❌ Discontinued | ❌ No data  | AOSP via PixelExperience/RevengeOS; final release v4.5.1 Sep 2021; repos inactive.                                                      |
| Ion OS                      | AOSP | ❌ Discontinued | ❌ No data  | AOSP/"Pixel Goodies"; org repos all last updated Sep 2, 2020, builds marked EOL 2020.                                                   |
| IronOS Project              | AOSP | ❌ Discontinued | ❌ No data  | AOSP/ProtonAOSP (A12); manifest last updated Mar 2022, Iron 2.2 Feb 2022.                                                               |
| Kang OS                     | AOSP | ❌ Discontinued | ❌ No data  | AOSP/AOKP; repos last updated Aug 2021, final v2.1 "Elixir" Jun 2021.                                                                   |
| Komodo OS                   | AOSP | ⚠️ Unclear      | ✅ GitHub   | AOSP; v5.0 Varanus (A15) builds Apr–May 2025; last GitHub activity May 2025.                                                            |
| Krypton Open Source Project | AOSP | ❌ Discontinued | ⚠️ GitHub   | AOSP; org tagged "[EOL]", moved to Flamingo-OS (CLO); repos last updated Jun 2023.                                                      |
| LegionOS                    | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Official devices repo last updated Feb 2021 (5+ years old); new org created 2023                                                        |
| LessAOSP                    | AOSP | ⚠️ Unclear      | ❌ No data  | AOSP; source last pushed Jul 2025, GSI builds Jun 2025; no 2026 activity found.                                                         |
| LibreMobileOS               | AOSP | ✅ Active       | ⚠️ Website  | Device list on website with wide manufacturer support, recent builds (Dec 2025), no machine-readable data                               |
| LightningFastRom            | AOSP | ❌ Discontinued | ❌ No data  | LineageOS forks; XDA thread labeled DISCONTINUED; last GitHub activity Feb 2024.                                                        |
| Liquid Remix                | AOSP | ❌ Discontinued | ⚠️ GitHub   | XDA announced "indefinite hiatus" 2019; org dormant since Jul 2020.                                                                     |
| LiquidSmooth                | AOSP | ❌ Discontinued | ⚠️ Website  | Discontinued 2016; no machine-readable data, only old XDA forum posts                                                                   |
| LLuvia OS                   | AOSP | ❌ Discontinued | ❌ No data  | XDA "Based On: AOSP+CAF"; last framework push May 2020, dead since.                                                                     |
| LunarUI                     | AOSP | ⚠️ Unclear      | ❌ No data  | WIP LineageOS fork, only 3 repos; no activity since Sep 2024, never released.                                                           |
| Magnus OS                   | AOSP | ❌ Discontinued | ❌ No data  | Org marked "(EOL)"; README says use LineageOS trees; last activity Jul 2023.                                                            |
| Mallu OS                    | AOSP | ❌ Discontinued | ⚠️ GitHub   | Org titled "Discontinued", repos archived; Android 10 era, last activity ~2022.                                                         |
| Miku UI                     | AOSP | ✅ Active       | ⚠️ GitHub   | AOSP; active 2026 (Blooming B4 builds Mar 2026); repos updated Sep 2026.                                                                |
| MoKee ROM                   | AOSP | ❌ Discontinued | ⚠️ Website  | Last nightlies Jan 6 2023; GitHub android repo dormant since Dec 2022; download site unreachable.                                       |
| MSM Xtended                 | AOSP | ❌ Discontinued | ❌ No data  | Development halted Jan 2022; final XT v7.6 (A13) builds mid-2023.                                                                       |
| Nitrogen OS                 | AOSP | ❌ Discontinued | ❌ No data  | Org archived Oct 25 2025; final Pixel 6a A14 work, last activity Jul 2025.                                                              |
| Nusantara Project           | AOSP | ❌ Discontinued | ⚠️ GitHub   | Site states development inactive; last device update May 2023, repos Dec 2023.                                                          |
| Octavi OS                   | AOSP | ⚠️ Unclear      | ❌ No data  | Staging org shows WIP commits to Jul 2025; original Octavi-OS org idle since 2022; no device-list repo.                                 |
| OmniROM                     | AOSP | ❌ Discontinued | ⚠️ Website  | Project officially closed in 2026 (started 2013); website shows "We are closed" announcement                                            |
| OrionOS                     | AOSP | ❌ Discontinued | ⚠️ GitHub   | README states LineageOS/crDroid base; OTA repo last commit Apr 2025; site orionos.tech/device.                                          |
| PalladiumOS                 | AOSP | ❌ Discontinued | ⚠️ GitHub   | Source idle since Dec 2023, OTA last Feb 2024; palladiumos.org offline.                                                                 |
| PhoenixAOSP                 | AOSP | ❌ Discontinued | ❌ No data  | "Phoenix Android 13 ROM"; all repos incl. vendor last updated Dec 2023.                                                                 |
| Pixel Blaster OS            | AOSP | ❌ Discontinued | ⚠️ Website  | Org says AOSP-based; repos last active Mar 2024; no devices.json found.                                                                 |
| Pixel Dust                  | AOSP | ❌ Discontinued | ❌ No data  | PixelDust Project X; last device commit Aug 2024, core source idle since ~2021.                                                         |
| PixelPlusUI                 | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Last commit Feb 2023 (3+ years ago), stuck on Android 13; requires fetching 48 individual device JSON files                             |
| Pixel Project               | AOSP | ❌ Discontinued | ⚠️ GitHub   | Org archived Mar 5 2026; official_devices has devices.json; last commit Nov 2025.                                                       |
| POSP                        | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | 181+ individual device repositories; last builds 2021-2022 (Android 11/13 era), no centralized device list                              |
| Project 404                 | AOSP | ✅ Active       | ⚠️ Website  | Manifest and vendor repos updated May 24 2026; AOSP experiments; no JSON list.                                                          |
| Project Arcana              | AOSP | ❌ Discontinued | ⚠️ GitHub   | Org marked [EOL]; last commits 2022; site lists ~24 devices; AEX-derived.                                                               |
| Project Blaze               | AOSP | ❌ Discontinued | ✅ GitHub   | official_devices last commit Jan 12 2025; manifest credits LineageOS.                                                                   |
| Project Elixir              | AOSP | ✅ Active       | ⚠️ Website  | Device list on website with wide manufacturer support; on Android 16, no machine-readable data source                                   |
| ProjectEverest              | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Manifest tracks lineage-21.0; last commits Oct–Nov 2024; per-device JSON files (e.g. X00TD.json).                                       |
| Project Kaleidoscope        | AOSP | ❌ Discontinued | ⚠️ Website  | Main org repos last updated Oct 14 2024; device trees in Kscope-Devices; no devices.json.                                               |
| Project Kasumi              | AOSP | ❌ Discontinued | ⚠️ GitHub   | GitHub org archived Apr 2024; last commits Mar 2024; README states LineageOS-based Materium.                                            |
| Project Lighthouse          | AOSP | ❌ Discontinued | ✅ GitHub   | Last commits Dec 2022; XDA A12 thread credits AOSP/LineageOS; official_devices.json lists codenames.                                    |
| Project Mushroom            | AOSP | ❌ Discontinued | ❌ No data  | Org marked "Deprecated", moved to Miku-UI; last manifest commit Apr 2025; no device list repo.                                          |
| Project Radiant             | AOSP | ❌ Discontinued | ✅ GitHub   | Last org activity Mar 2024 (web repo); XDA A12 threads tag AOSP; device list is markdown only.                                          |
| Project Sakura              | AOSP | ✅ Active       | ⚠️ GitHub   | Commits Aug 2026; frameworks_base forked from LineageOS "Android 16"; devices.json in OTA repo.                                         |
| Project Streak              | AOSP | ❌ Discontinued | ⚠️ GitHub   | Last commits Jun 2022; org description redirects to @tequilaOS; only one device OTA file exists.                                        |
| Project Titanium            | AOSP | ❌ Discontinued | ❌ No data  | Last commits Apr 2020; org description says AOSP-based; no device list repo, website only.                                              |
| Project Zephyrus            | AOSP | ❌ Discontinued | ❌ No data  | Org archived Feb 2025; last commits Sep 2024; XDA calls it "ProtonKnockOff", mostly Proton-based.                                       |
| Proton AOSP                 | AOSP | ❌ Discontinued | ⚠️ Website  | Site banner "no longer maintained"; last commit Dec 2022; page lists 6 Pixel codenames, no JSON.                                        |
| ReloadedOS                  | AOSP | ⚠️ Unclear      | ✅ GitHub   | Site says CAF-based; last commits Jun 2024; device.json in Reloaded-Devices/official_devices.                                           |
| Replicant                   | AOSP | ⚠️ Unclear      | ⚠️ Website  | Only 8 maintained devices (2010-2013 era Galaxy devices), no machine-readable data source                                               |
| Resurrection Remix OS       | AOSP | ❌ Discontinued | ✅ API      | Main org last commit Feb 2023; site still advertises RR 8.6 (Android 10); revival fork archived 2025.                                   |
| ResurrectionRemix-Revived   | AOSP | ❌ Discontinued | ❌ No data  | GitHub org archived 2025-01-04; last commits Aug 2024; resurrectionremix.com stale (Android 10, spam blog).                             |
| Revenge OS                  | AOSP | ❌ Discontinued | ⚠️ GitHub   | SourceForge last release 2021-10; GitHub commits to Dec 2022; ships per-device maintainers.json.                                        |
| RevOS                       | MIUI | ❌ Discontinued | ⚠️ Website  | SourceForge RevOS-MIUI last updated 2019-12-23; MIUI custom ROM for Xiaomi; no device JSON.                                             |
| RohieOS                     | AOSP | ❌ Discontinued | ⚠️ GitHub   | Last manifest commit Jun 2023; official_devices lists only jasmine_sprout (branch 11).                                                  |
| Scorpion ROM                | AOSP | ❌ Discontinued | ❌ No data  | Last repo activity Feb 2022; scorpionrom.com now offline; manifest credits AOSP, Dirty Unicorns, ABC.                                   |
| SerasaOS                    | AOSP | ⚠️ Unclear      | ❌ No data  | 87 AOSP repos, last commit Nov 2024; no releases, device list, or public site found.                                                    |
| ShapeShift OS               | AOSP | ❌ Discontinued | ❌ No data  | Last activity Apr 2024 (Android 13 manifest); shapeshiftos.com JS-only; trees at ShapeShiftOS-Devices.                                  |
| SigmaDroid                  | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Manifest credits crDroid/LineageOS; per-codename OTA JSON; latest commits May–Jul 2025.                                                 |
| SkylineUI                   | AOSP | ❌ Discontinued | ⚠️ GitHub   | Organization archived Feb 2025; only 2 devices, stuck on Android 13, last builds 2023-2024                                              |
| SlimRoms                    | AOSP | ❌ Discontinued | ✅ GitHub   | Last release Slim7 2.0 in 2018; site data/devices.json is machine-readable; GitHub to Nov 2021.                                         |
| SomethingOS                 | AOSP | ❌ Discontinued | ❌ No data  | Archived 2025-04-18 and rebranded ArfoxOS (LineageOS fork, Android 16, active Jun 2026).                                                |
| SoniUI                      | AOSP | ❌ Discontinued | ❌ No data  | XOSP-Reborn inactive since May 2021; README says org abandoned at Android 12; no device list.                                           |
| SparkOS                     | AOSP | ✅ Active       | ⚠️ GitHub   | spark-os.tech/download lists 20 official devices (2026); public source repos stale since 2023.                                          |
| Spice OS                    | AOSP | ❌ Discontinued | ⚠️ GitHub   | AOSP, "Under Rebase"; last commits Mar 2023.                                                                                            |
| Stag OS                     | AOSP | ❌ Discontinued | ⚠️ GitHub   | AOSP 14 (android-14.0.0_r54); last commits Sep 2024; no machine-readable list.                                                          |
| StatiX OS                   | AOSP | ✅ Active       | ⚠️ GitHub   | Frameworks updated Aug 2026; per-device manifest XML, builds listed 13–16.                                                              |
| SuperiorOS                  | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Core repos last updated Jan 2025; requires fetching 70+ individual device JSON files from two repos                                     |
| Syberia OS                  | AOSP | ❌ Discontinued | ⚠️ GitHub   | Last official build Mar 2024 (v7.1/Android 14); per-device OTA JSON.                                                                    |
| TenXOS                      | AOSP | ❌ Discontinued | ❌ No data  | LineageOS 21 base; last commits Dec 2024; device list is markdown.                                                                      |
| Tequila OS                  | AOSP | ❌ Discontinued | ❌ No data  | GitHub org archived Aug 2025; last code commits Sep 2024; no device repo.                                                               |
| The Kraken Project          | AOSP | ❌ Discontinued | ⚠️ GitHub   | AOSP; last commits 2022; devices.json plus AOSPK-Devices trees.                                                                         |
| The Styx Project            | AOSP | ❌ Discontinued | ⚠️ GitHub   | Pure AOSP (android-15.0.0_r9); repo commits Dec 2024, device org last 2022.                                                             |
| The XPerience Project       | AOSP | ✅ Active       | ⚠️ GitHub   | CLO/CAF; commits up to Sep 2026; wiki-generated device YAML.                                                                            |
| Tipsy OS                    | AOSP | ❌ Discontinued | ❌ No data  | SlimRoms-derived (forks); last commits Nov 2020; no device list.                                                                        |
| Toxyc OS                    | AOSP | ❌ Discontinued | ❌ No data  | AOSP; last commits Nov 2020; no device list or JSON.                                                                                    |
| UlimateOS                   | AOSP | ❌ Discontinued | ❌ No data  | AOSP; last commits Sep 2024; official-devices link broken.                                                                              |
| Validus OS                  | AOSP | ❌ Discontinued | ❌ No data  | Dead GZOSP-based ROM; org repos last updated Aug 2020, Android 10 era.                                                                  |
| Viper OS                    | AOSP | ❌ Discontinued | ⚠️ GitHub   | Discontinued Pie ROM; SourceForge last update 2019-10-27, site still online.                                                            |
| VoidUI                      | AOSP | ❌ Discontinued | ❌ No data  | Archived Apr 2024; last source push Mar 2024 (Android 14), development abandoned.                                                       |
| VoltageOS                   | AOSP | ✅ Active       | ⚠️ GitHub   | Text file with codenames only, no device names; requires codename-to-name mapping                                                       |
| WaveOS                      | AOSP | ❌ Discontinued | ❌ No data  | EOL after last build Oct 2021; repos last touched Oct 2022, maintainership closed.                                                      |
| Weeb Projekt                | AOSP | ❌ Discontinued | ❌ No data  | Beta AOSP fork; last commit Aug 2022, SourceForge build Dec 2020.                                                                       |
| WitAqua                     | AOSP | ✅ Active       | ⚠️ GitHub   | Active Lineage-based ROM; A16 QPR2/A17 WIP, Dec 2025 SPL, commits Sep 2026.                                                             |
| Xdroid CAF                  | AOSP | ❌ Discontinued | ❌ No data  | Superseded CAF variant of xdroidOSS; org's last commit Aug 2023 before move to xdroid-oss.                                              |
| Xdroid OS                   | AOSP | ✅ Active       | ✅ GitHub   | Reborn Apr 2026 under Nauzyx Labs; org now branded "z0", AOSP repos pushed Jul 2026.                                                    |
| Xen AOSP                    | AOSP | ⚠️ Unclear      | ❌ No data  | No official GitHub/site or device list found; only the unrelated Linaro xen-aosp hypervisor project                                     |
| Xenon HD                    | AOSP | ❌ Discontinued | ⚠️ Website  | Dead AOSP/Lineage ROM; last commits Nov 2022, official site stuck on 2018 Pie.                                                          |
| xiaomi.eu                   | MIUI | ✅ Active       | ⚠️ Website  | Device list in forum thread; community-modified MIUI ROM with multilingual support, requires web scraping                               |
| YAAP AOSP                   | AOSP | ✅ Active       | ⚠️ GitHub   | Active AOSP fork; Android 16 QPR2 releases Jan 2026, repos pushed Sep 2026.                                                             |
| ZeusOS                      | AOSP | ❌ Discontinued | ❌ No data  | Dead Android 11 Lineage-based ROM; core repos last updated 2021 (manifest 2023).                                                        |

## Per-device references

Every edge should cite a **device-specific** source a human can open and check:
the ROM's own page for that device. A project homepage or a download link is not
a citation. Coverage per source:

- **A — URL already in the raw data.** The fetcher receives a device-specific
  URL; it must be emitted as the reference (some fields are downloads or
  contact links, not citations).
- **B — deterministic device page.** A per-device page exists and is derivable
  from the codename (verified live).
- **C — list-only.** No per-device page; cite a pinned deep link to the exact
  file/commit the record came from.
- **D — no device-specific page.** Cite the source index if one exists and
  record it here as an exception.

| Source             | Class | Reference                                                           |
| ------------------ | ----- | ------------------------------------------------------------------- |
| LineageOS          | A     | `wiki.lineageos.org/devices/<codename>/`                            |
| Paranoid Android   | A/C   | `xda_thread`, else pinned `AOSPA/ota` devices file                  |
| PixysOS            | A/B   | `supported_bases[].xda_thread`, else `pixysos.com/<codename>`       |
| Evolution X        | A     | `forum` (fallback `download`)                                       |
| BlissROMs          | A     | `supported_versions[].support_thread`                               |
| Project Infinity X | A/B   | `projectinfinity-x.com/downloads/<codename>` (fallback Telegram)    |
| CherishOS          | A     | `downloadUrl` (download, not a device page)                         |
| CorvusOS           | D     | exception: site/download host dead; SourceForge root only           |
| crDroid            | B     | `crdroid.net/<codename>/<major>` (site index), else pinned OTA JSON |
| DerpFest           | C     | SourceForge `files/<codename>/`, else pinned `devices-index.json`   |
| Lunaris AOSP       | A/C   | `forum`, else pinned OTA `builds/<codename>.json`                   |
| PixelExtended      | A     | `forum_url`/`xda_thread`, else pinned OTA `builds/<codename>.json`  |
| Project PixelAge   | A     | `url` (download, not a device page)                                 |
| RisingOS           | A     | maintainer profile (weak)                                           |
| PixelExperience    | B     | `download.pixelexperience.org/<codename>`                           |
| PixelOS            | B     | `pixelos.net/download/<codename>`                                   |
| Clover             | B     | `thecloverproject.com/download?device=<codename>`                   |
| dotOS              | B     | `www.droidontime.com/devices/<codename>`                            |
| /e/OS              | B     | `doc.e.foundation/devices/<codename>`                               |
| Kenvyra            | B     | `Kenvyra/website/src/devices/<codename>.md`                         |
| AICP               | C     | pinned `vendor_jenkins/aicp-build-targets`                          |
| ArrowOS            | C     | pinned `arrow_infrastructure_devices/arrow.devices`                 |
| Havoc-OS           | C     | pinned `Havoc-OS/Devices` devices file                              |
| iodéOS             | C     | `iode.tech/iodeos-official-supported-devices` (index)               |
| Kali NetHunter     | C     | pinned `kali-nethunter-kernels` devices.yml                         |
| AwakenOS           | C     | pinned `Project-Awaken/official_devices` devices.json               |
| DroidX-UI          | C     | pinned `DroidX-UI-Devices/vendor_droidxOTA` devices.json            |
| Matrixx            | C     | pinned `Matrixx-Devices/official_devices` devices.json              |
| AfterlifeOS        | C     | pinned `AfterlifeOS/device_afterlife_ota` devices.json              |
| MistOS             | C     | pinned `MistOS-Devices/official_devices` buildDevices.json          |

## Legend

**Base:**

- AOSP: Built from Android Open Source Project
- MIUI: Based on Xiaomi's proprietary MIUI
- Other: Other proprietary Android skins

**Data Source:**

- ✅ GitHub/GitHub API/GitLab/GitLab API: Direct file access, easy to implement
- ✅ API: Structured API endpoint, easy to implement
- ⚠️ GitHub/GitLab: Multiple files or complex structure, more prone to breaking changes
- ⚠️ Website: Web scraping, unreliable and could change with UI updates
- ❌ No data: No available device list

**Project Status:**

- ✅ Active: Project is actively maintained
- ⚠️ Unclear: Project status is unclear or inconsistent
- ❌ Discontinued: Project has been officially shut down
- ❓ Unknown: Project status not investigated
