# ROM Triage

Which of the ROMs with no device data have a public, machine-readable roster.
Produced on 2026-11-10 from the catalogue in `server/src/data/roms.ts` and the
source links in
[musabcel/android_rom_list](https://github.com/musabcel/android_rom_list) and
[devadigax/awesome-android-custom-rom](https://github.com/devadigax/awesome-android-custom-rom).

## Method

1. Take the catalogue ROMs whose `rom_devices` rows are empty (237 of 277).
2. Resolve each one to its GitHub org or website from the two lists (150 of 237
   resolved; 87 have no public link).
3. List each org's repositories and look for roster-shaped JSON/YAML/XML under
   names such as `ota`, `official_devices`, `devices`, `website`, `*.github.io`.
4. Fetch and parse each candidate: count codenames and take the last commit
   date for that file.

Counts are codenames in the file at scan time, not a guarantee that every entry
maps to a device in the registry. Old files are kept in the list with their
date so the staleness is visible.

## Current coverage

- 277 catalogue ROMs; 40 have device data, 237 do not.
- Of the 237: 31 active, 103 unknown, 103 discontinued; 168 are already marked
  ❌ in `ROM_COVERAGE.md` and 69 are unevaluated.
- The 31 active ROMs were all previously marked ❌, so this is largely a
  re-check of stale evaluations, not first-time discovery.

Progress: Tier 1 (5 ROMs) and three of the four Tier 2 ROMs are implemented,
taking the catalogue from 40 to 48 ROMs with device data. Project 404 was
skipped; see Tier 2.

## Tier 1 — active, one clean JSON file

Best first batch: one fetcher and one normalizer each, stable URLs, current
branches.

| ROM           | Devices | File updated | Source                                                                                                                                                                              |
| ------------- | ------: | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2by2 Project  |       5 | 2026-06-16   | [`devices.json`](https://github.com/2by2-Project/android_vendor_2by2-ota/blob/main/devices.json) + [legacy](https://github.com/2by2-Project/vendor_2by2-ota/blob/main/devices.json) |
| ProjectSakura |       2 | 2026-09-30   | [`OTA/devices.json`](https://github.com/ProjectSakura/OTA/blob/16/devices.json)                                                                                                     |
| WitAqua       |       5 | 2025-03-07   | [`data/devices.json`](https://github.com/WitAqua/WitAquaOTA/blob/main/data/devices.json)                                                                                            |
| GenesisOS     |      16 | 2024-09-14   | [`devices/DeviceList.json`](https://github.com/GenesisOS/Website-Data/blob/v2/devices/DeviceList.json)                                                                              |
| EtherealOS    |       2 | 2026-01-01   | [`devices.json`](https://github.com/Ethereal-OS/Ethereal-Devices/blob/A14/devices.json)                                                                                             |

2by2 publishes one roster per Android branch, so the current `android_vendor_*`
file and the legacy `vendor_*` file are unioned. EtherealOS's A13 file is
truncated upstream; the A14 branch is a clean array and is the one to use.

## Tier 2 — active, a directory of per-device JSON

The codenames are file or directory names, so the roster comes from a GitHub
tree listing. One shared fetcher (tree API, one request per repo) can serve
these, but the tree API is rate-limited to 60 requests an hour unauthenticated;
keep it to one call per repo per refresh.

| ROM                | Devices | Status      | Source                                                                       |
| ------------------ | ------: | ----------- | ---------------------------------------------------------------------------- |
| Project 404        |      19 | Skipped     | `P-404/android_packages_services_ota/devices/*.json` — roster frozen in 2023 |
| SparkOS            |      20 | Implemented | `spark-os.tech/download` `__NEXT_DATA__` (GitHub roster stopped in 2022)     |
| YAAP               |      13 | Implemented | `yaap/device-info/*/*.json` (its site also proxies this through a worker)    |
| Black Iron Project |      11 | Implemented | `Black-Iron-Project/OTA/builds/*.json`                                       |

Project 404 is skipped rather than added: its org is active, but the only
machine-readable roster is the 2023 OTA repository and the current site is
behind a login. Publishing that list would claim support that has not been
built since 2023.

## Tier 3 — discontinued, one clean JSON file

Single-file rosters from dormant projects. They still make the ROM page
indexable and add internal links, but the data is historical; prefer the newer
files and treat 2017–2020 snapshots as last-known support.

| ROM                | Devices | File updated | Source                                                        |
| ------------------ | ------: | ------------ | ------------------------------------------------------------- |
| AOSiP              |      68 | 2021-07-21   | `AOSiP/api/devices.json`                                      |
| Project Blaze      |      58 | 2024-12-03   | `ProjectBlaze/official_devices/devices.json`                  |
| SlimRoms           |      54 | 2017-11-05   | `slimroms/slimroms.github.io/data/devices.json`               |
| The Kraken Project |      36 | 2022-02-07   | `AOSPK/official_devices/devices.json`                         |
| TequilaOS          |      35 | 2024-03-22   | `tequilaOS/tequila_ota/devices.json`                          |
| Project Lighthouse |      25 | 2022-04-15   | `lighthouse-os/official_devices/official_devices.json`        |
| FreakyOS           |      20 | 2020-10-29   | `FreakyOS/ota_config/devices.json`                            |
| PalladiumOS        |      13 | 2022-03-31   | `Palladium-OS/official_devices/devices/official_devices.json` |
| PixelStar          |      12 | 2024-12-03   | `Project-PixelStar/official_devices/devices.json`             |
| ReloadedOS         |      12 | 2021-10-01   | `ReloadedOS/official_devices/device.json`                     |
| ZeusOS             |       8 | 2021-07-06   | `Zeus-OS/website_data/devices.json`                           |
| WaveOS             |       6 | 2021-06-16   | `Wave-Project/website-api/devices.json`                       |
| SomethingOS        |       4 | 2024-07-13   | `SomethingOS/website_devices/devices.json`                    |
| CatalystOS         |       3 | 2022-11-01   | `catalyst-android/OTA/devices.json`                           |
| AIM ROM            |       2 | 2020-04-09   | `AIMROM/aimrom.github.io/json/devices.json`                   |

## Tier 4 — active, roster only in HTML or a site API

No static file: the site renders the list itself or asks an endpoint. These
need a parser per site (or a network trace to find the endpoint) and are more
fragile than the tiers above.

- CarbonROM — `get.carbonrom.org` serves a DataTables page over the build index.
- halogenOS — `halogenos.org/devices`.
- CipherOS — `cipheros.org.in/devices`.
- LMODroid — site did not resolve during the scan; check `lmodroid.org`.
- StatiXOS — site did not resolve; `StatiXOS/releases` only holds a workflow.
- VoltageOS — `Website-Resource` is images only; the site is a JS app.
- Halcyon, Project Elixir, Miku-UI, The XPerience Project, Xdroid, EuclidOS —
  org exists but no roster-shaped file was found.

## Not rosters (avoid)

These parse as device-shaped XML/JSON but are Android build metadata, not
supported-device lists: `EunoiaOS/*/devices.xml` (AOSP emulator config),
`FlokoROM`/`LiquidRemix`/`ResurrectionRemix` `packages_apps_*OTA` `ota.xml`
(app resources), and the per-device `ota.json` files under
`AOSP-Krypton/ota` and `Project-Zephyrus/OTA` (one build each; only useful if
the directory listing is enumerated).

## Tier 5 — no public link

87 of the 237 have no GitHub or website in either list. All but seven are
`unknown` or `discontinued`, so they are likely dormant or Telegram-only.
The active ones worth a manual look: LeaOS, LeaOS-OSS, MicaOS, MinusOS,
PenguinOS, The Parasite Project, xiaomi.eu.

## Suggested order

1. Tier 1 (5 ROMs, 30 devices) — done.
2. Tier 2 (3 ROMs, 44 devices) — done; Project 404 skipped as stale.
3. Tier 3 by file date, newest first (Project Blaze, TequilaOS, PixelStar,
   SomethingOS, Kraken, Lighthouse, …). Skip 2017–2018 files unless the ROM is
   notable enough to carry its last-known roster.
4. Tier 4 only where a stable endpoint exists; do not scrape a JS-only site.
5. Leave Tier 5 alone unless a link turns up from another source.

`ROM_COVERAGE.md` still marks several of these ❌. Update it as each ROM is
implemented.
