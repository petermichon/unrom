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

| ROM                | Base | Project Status | Data Source   | Notes                                                                                                         |
| ------------------ | ---- | -------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| AICP               | AOSP | ✅ Active      | ✅ GitHub     | Build targets file with device codenames; ~12 active devices on Android 16 (w16.0 branch)                     |
| AfterlifeOS        | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 20+ devices on Android 16                                                       |
| ArrowOS            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Data from March 2024 (2+ years old), but project shows some recent activity (Sept 2025)                       |
| AwakenOS           | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 15 devices across Xiaomi, Redmi, OnePlus, realme, Motorola                      |
| BlissROMs          | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                               |
| CherishOS          | AOSP | ✅ Active      | ✅ API        | API endpoint with 16 devices, last updated Dec 2025; includes recent devices like Xiaomi 13, OnePlus 13       |
| Clover             | AOSP | ✅ Active      | ✅ API        | Single devices.json file with 19 devices across Poco, Motorola, Nothing, Realme, Redmi, Xiaomi; on Android 16 |
| CorvusOS           | AOSP | ⚠️ Unclear     | ✅ GitHub     | Single devices.json file with 15+ devices; last builds Nov 2022 (vT5.1, Android 13), project appears inactive |
| DroidX-UI          | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 20+ devices across Xiaomi, Nothing, Google, Samsung; last updated July 2025     |
| dotOS              | AOSP | ⚠️ Unclear     | ✅ GitHub     | Last commit Sept 2022, stuck on Android 12; July 2022 announcement about restarting but no activity since     |
| /e/OS              | AOSP | ✅ Active      | ⚠️ GitLab     | **Frozen**: the GitLab releases repo is no longer publicly readable; committed snapshots are still normalized |
| Evolution X        | AOSP | ✅ Active      | ✅ GitHub API | Individual device JSON files in `builds/` directory, last updated July 2026                                   |
| HavocOS            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Data from Sept 2023 (3 years old); HavocOS Revived exists but has no device tracking                          |
| iodéOS             | AOSP | ✅ Active      | ✅ GitLab API | Device directories in GitLab repository tree; fetched via GitLab API                                          |
| Kali NetHunter     | AOSP | ✅ Active      | ✅ GitLab     | Device kernels YAML with detailed device information and Android versions                                     |
| Kenvyra            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Device data in Markdown files with YAML frontmatter; 4 devices                                                |
| LineageOS          | AOSP | ✅ Active      | ✅ GitHub API | Device list via GitHub API, actively maintained with wide device support                                      |
| Matrixx            | AOSP | ✅ Active      | ✅ GitHub     | Single devices.json file with 30+ devices across Xiaomi, POCO, OnePlus                                        |
| MistOS             | AOSP | ✅ Active      | ✅ GitHub     | Single buildDevices.json file with 25+ devices on Android 16                                                  |
| Paranoid Android   | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                               |
| PixelExperience    | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                               |
| PixelOS            | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                               |
| PixysOS            | AOSP | ⚠️ Unclear     | ✅ GitHub     | Core repos last updated July 2024 (2 years old); devices list may be outdated                                 |
| Project Infinity X | AOSP | ✅ Active      | ✅ GitHub API | Individual device JSON files via GitHub API; fetched with a two-stage fetch                                   |
| Project PixelAge   | AOSP | ✅ Active      | ✅ GitHub API | Individual device JSON files via GitHub API; 15 devices on Android 15, A16 WIP                                |
| RisingOS           | AOSP | ✅ Active      | ✅ GitHub     |                                                                                                               |

### Not Implemented

| ROM            | Base | Project Status  | Data Source | Notes                                                                                                       |
| -------------- | ---- | --------------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| AlphaDroid     | AOSP | ✅ Active       | ⚠️ GitHub   | 100+ individual device JSON files in OTA repository; requires fetching many files                           |
| AXP.OS         | AOSP | ✅ Active       | ⚠️ Website  | Device list on website; main sources require login; no machine-readable data source (15+ devices)           |
| AncientOS      | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Single website_api.json file with 70+ devices; data from 2022, last repo update Sept 2023                   |
| AospExtended   | AOSP | ❌ Discontinued | ⚠️ GitHub   | Suspended indefinitely August 2022; individual device repositories, no centralized device list              |
| CalyxOS        | AOSP | ✅ Active       | ⚠️ Website  | Device list on website, includes latest Pixel 9 series and 2024 Motorola devices, requires web scraping     |
| ColtOS         | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Rebranded as Colt-Enigma; device builds on Android 11 from 2021; individual device JSON files               |
| crDroid        | AOSP | ✅ Active       | ⚠️ GitHub   | Project active (core repos updated July 2026), but device repos severely outdated (last push 2016-2020)     |
| CyanogenMod    | AOSP | ❌ Discontinued | ⚠️ Website  | Officially shut down December 2016 (10 years ago); succeeded by LineageOS (already implemented)             |
| DerpFest       | AOSP | ✅ Active       | ⚠️ GitHub   | 327 device repositories in GitHub organization, no centralized machine-readable device list                 |
| DivestOS       | AOSP | ❌ Discontinued | ⚠️ GitHub   | Mobile OS discontinued December 2024; device data in shell script arrays (~170 devices), complex parsing    |
| GrapheneOS     | AOSP | ✅ Active       | ⚠️ Website  | Device list on website, includes latest Pixel 10 series, requires web scraping                              |
| LegionOS       | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Official devices repo last updated Feb 2021 (5+ years old); new org created 2023                            |
| LibreMobileOS  | AOSP | ✅ Active       | ⚠️ Website  | Device list on website with wide manufacturer support, recent builds (Dec 2025), no machine-readable data   |
| LiquidSmooth   | AOSP | ❌ Discontinued | ⚠️ Website  | Discontinued 2016; no machine-readable data, only old XDA forum posts                                       |
| OmniROM        | AOSP | ❌ Discontinued | ⚠️ Website  | Project officially closed in 2026 (started 2013); website shows "We are closed" announcement                |
| PixelPlusUI    | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Last commit Feb 2023 (3+ years ago), stuck on Android 13; requires fetching 48 individual device JSON files |
| POSP           | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | 181+ individual device repositories; last builds 2021-2022 (Android 11/13 era), no centralized device list  |
| Project Elixir | AOSP | ✅ Active       | ⚠️ Website  | Device list on website with wide manufacturer support; on Android 16, no machine-readable data source       |
| Replicant      | AOSP | ⚠️ Unclear      | ⚠️ Website  | Only 8 maintained devices (2010-2013 era Galaxy devices), no machine-readable data source                   |
| SkylineUI      | AOSP | ❌ Discontinued | ⚠️ GitHub   | Organization archived Feb 2025; only 2 devices, stuck on Android 13, last builds 2023-2024                  |
| SuperiorOS     | AOSP | ⚠️ Unclear      | ⚠️ GitHub   | Core repos last updated Jan 2025; requires fetching 70+ individual device JSON files from two repos         |
| VoltageOS      | AOSP | ✅ Active       | ⚠️ GitHub   | Text file with codenames only, no device names; requires codename-to-name mapping                           |
| xiaomi.eu      | MIUI | ✅ Active       | ⚠️ Website  | Device list in forum thread; community-modified MIUI ROM with multilingual support, requires web scraping   |

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

| Source             | Class | Reference                                                        |
| ------------------ | ----- | ---------------------------------------------------------------- |
| LineageOS          | A     | `wiki.lineageos.org/devices/<codename>/`                         |
| Paranoid Android   | A     | `xda_thread`                                                     |
| PixysOS            | A     | `supported_bases[].xda_thread`                                   |
| Evolution X        | A     | `forum`                                                          |
| BlissROMs          | A     | `supported_versions[].support_thread`                            |
| Project Infinity X | A/B   | `projectinfinity-x.com/downloads/<codename>` (fallback Telegram) |
| CherishOS          | A     | `downloadUrl` (download, not a device page)                      |
| CorvusOS           | D     | exception: site/download host dead; SourceForge root only        |
| Project PixelAge   | A     | `url` (download, not a device page)                              |
| RisingOS           | A     | maintainer profile (weak)                                        |
| Kali NetHunter     | A     | kernel git repo (weak)                                           |
| MistOS             | A     | Telegram/donate (weak)                                           |
| PixelExperience    | B     | `download.pixelexperience.org/<codename>`                        |
| PixelOS            | B     | `pixelos.net/download/<codename>`                                |
| Clover             | B     | `thecloverproject.com/download?device=<codename>`                |
| dotOS              | B     | `www.droidontime.com/devices/<codename>`                         |
| /e/OS              | B     | `doc.e.foundation/devices/<codename>`                            |
| AICP               | C     | pinned `vendor_jenkins/aicp-build-targets`                       |
| ArrowOS            | C     | pinned `arrow_infrastructure_devices/arrow.devices`              |
| Havoc-OS           | C     | pinned `Havoc-OS/Devices`                                        |
| iodéOS             | C     | `iode.tech/iodeos-official-supported-devices` (index)            |
| AwakenOS           | D     | exception: no device page                                        |
| DroidX-UI          | D     | exception: no device page                                        |
| Matrixx            | D     | exception: no device page                                        |
| Kenvyra            | D     | exception: 4 devices, no page                                    |
| AfterlifeOS        | D     | exception: no device page                                        |

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
