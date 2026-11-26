# The dataset

One place for what the dataset covers, where each fact comes from, what is
missing and why, and what is being worked on. The authoritative lists stay in
code (`server/src/ingest/sources.ts` for fetchers,
`server/src/sources/registry.ts` for normalizers); upstream attribution stays in
`ATTRIBUTION.md`.

## Contents

- [Backlog](#backlog)
- [Coverage](#coverage)
- [Sources](#sources)
- [Triage](#triage)
- [Evidence](#evidence)

## Backlog

- [ ] Record bootloader-unlock status per device. The demand is logged in
      the evidence log below (2026-11-12 and 2026-11-14): two independent
      recommendations name the site and then point readers to bootloader-unlock
      information. Search already covers vendor, model and codename, so the gap
      is coverage, not discovery. Open questions: one field or a
      tri-state (unlockable / locked / unknown); an authoritative per-vendor
      source for each; whether it belongs in `contract/` (a versioning
      decision); and how to validate the whole catalogue rather than assume it.
      Interim: the devices page now says that a ROM listing is not a claim that
      the bootloader can be unlocked, and a device page with no vendor policy
      shows an explicit Unknown instead of nothing. Vendor-level policies cover
      seven vendors, and Samsung and ASUS cannot be added: neither publishes a
      policy page. Samsung removed unlocking from One UI 8 with no public
      statement, and ASUS's unlock-tool FAQ returns 404. The next step is the
      per-device field, which needs the contract decision above.
- [ ] Record vendor support end dates per device, with a source. This is the
      one fact that unlocks the two remaining groups (long support: end date
      five years out; legacy: support ended). `endoflife.date` has dates for
      Pixel, OnePlus, Motorola and Fairphone, but not for Samsung phones or
      Xiaomi, so the coverage decision comes first: ship a labelled partial
      set, or wait for vendor-level data.
- [ ] Record the per-device facts a "which build for this device" filter needs,
      each with a source: relock / verified-boot support (a different question
      from whether the vendor allows unlocking). Relock is recorded per pair
      from project statements, and the newest build date and patch level from
      every roster that publishes them. "Hardened" is not a facet until it is
      defined as checkable predicates (patch level, relock, support end), not a
      label.
- [ ] Separate official from unofficial builds per device–ROM mapping. Some
      sources publish it (DerpFest's `romtype`), most do not; where it exists it
      answers whether a device runs the project's own build or a maintainer's.
      Coverage headlines currently mix both, and the third blocked group needs
      it.
- [ ] Add the remaining device groups. Hardened, relock supported, recently
      updated and with ROMs have dedicated pages under `/device-groups`, and
      the menu links to them. Long support, legacy and official builds stay
      blocked by the two data items above. Each group is a property of the
      device–ROM pair, so a pair may appear in several.
- [ ] Record the Android version per device–ROM pair. `os_sdk_level` and the
      release string sit in the same OTA metadata as the build date, which is
      now recorded; the version is not, and it covers only 135 mappings today.
      It is a field on `BuildInfo`, so it needs a `contract/` versioning
      decision before it can ship, even though the parse itself is small.
- [ ] Define "reach" and instrument it before changing the frontend. The only
      figure today is that under 0.1% of visits reach the data page, which
      measures one page rather than how the data is consumed. Record device→ROM
      outbound clicks, filter use, export downloads and search→page arrivals,
      then decide from those whether a page or the data page is under-discovered
      or correctly niche.
- [ ] Own the device-agnostic install query. The SEO audit found no
      authoritative page for "how to install a custom rom": the lowest
      cross-engine agreement of the set (J=0.07), no official project docs in
      three of four engines. The page that fits this dataset is a router: pick
      the device, then follow that ROM's own instructions. Never invented
      steps. Write the "router, never steps" rule before building it.
- [ ] Add ROM-vs-ROM comparison pages only where the data supports one.
      "GrapheneOS vs CalyxOS" is answered by shops, blogs and Reddit because no
      project page does. Generate a page only for pairs that share enough
      devices to state something checkable, so the result is not a thin doorway
      page.
- [ ] Reconsider the data page once reach is instrumented. It already carries
      JSON, SQLite and OpenAPI; whether it needs to become a clearer entry point
      or is correctly niche depends on the measurement above, not on taste.
- [ ] Check click depth across the site, as a UX and as a crawl: every page
      should be at most three links from the home page, and no indexable page
      should need a search to reach. Start from `/`, follow the links the
      sitemap lists and record the depth per route; fix the deepest ones in the
      navigation or the hubs (devices, brands, ROMs, groups, data, methodology)
      rather than by adding links to every page. Device and ROM pages are the
      long tail and may sit one hop further than their hub.
- [ ] Find the queries the site receives impressions for without a page that
      answers them. Export Search Console queries with impressions and no
      matching URL, group them by intent (a device model, a ROM, a task such as
      installing a custom ROM), and record each gap. A gap that needs data goes
      to the coverage list; one an existing page already answers becomes a
      title or copy fix, not a new page. Needs Search Console access; the export
      is small, the credentials are the blocker.
- [ ] Publish source freshness, not only build dates. `ingest` now records when
      each source was last reached and why the last attempt failed
      (`server/source-health.json`), and `check:sources` fails a refresh while a
      source is stale or unreachable. The record stops at the pipeline: a reader
      cannot tell that a ROM's roster has not been reachable for a week, so
      "no new builds" still has two meanings. Exposing the last success per
      source on the API and the ROM page needs a contract decision (a field on
      the ROM or a separate source-health resource).

### Parked

Revisit when the blocker changes, not before.

- [ ] Record whether a ROM's builds are reproducible. A source host is recorded
      for 52 of the 274 ROMs (`rom-sources.ts`, shown as "Project source" on the
      ROM page); the rest are mostly projects whose roster is a website.
      Reproducibility is the other half of "can I check this": GrapheneOS
      publishes it, most projects do not, so add the flag when it can be stated
      per project rather than assumed. Blocker: it is a per-project fact with no
      shared source.
- [ ] Record the last commit per project, completing the freshness picture. The
      build date is now on every mapping whose roster publishes a timestamp, and
      an active project whose newest build is over a year old is labelled. The
      last commit needs a repository URL per project, not just the organisation
      `rom-sources.ts` holds; GitHub allows 60 unauthenticated API requests an
      hour, so it needs a token or a committed snapshot. Blocker: that
      infrastructure.
- [ ] Publish a diff between builds: what changed since the last one. The
      content hash already changes; humans cannot see why. Needs build history,
      which the pipeline does not keep today. Blocker: that history.

Decided against, so it is not proposed again: a Play Integrity / banking status
page. The fact is not ours to verify, it decays within weeks, and a stale answer
is exactly the false claim the project refuses to publish.

## Coverage

Index of Android ROM projects from
[musabcel/android_rom_list](https://github.com/musabcel/android_rom_list) and
[devadigax/awesome-android-custom-rom](https://github.com/devadigax/awesome-android-custom-rom).
🟢 = implemented · ❌ = evaluated, not implemented · unmarked = not yet evaluated.
Implemented ROMs use unrom's canonical names.

Out of scope: recoveries, root tools, GSIs and repacks, OEM stock skins.

- 🟢 2by2 Project
- Abhix MIUI
- AetheriaOS
- AetherOS
- 🟢 AfterlifeOS
- 🟢 AICP
- 🟢 AIM ROM
- Alch3myOS
- 🟢 AlphaDroid
- ❌ AlrightOS
- Altair ROM
- ❌ AmogOS Rom
- ❌ AmyROM
- ❌ Ancient OS
- Androidfuckery
- ❌ AOKP
- ❌ AOSDP
- 🟢 AOSiP
- 🟢 AOSP Extended
- ❌ Aquari OS
- AquariumUI
- ❌ ArfoxOS
- 🟢 ArrowOS
- ASCP
- ASCP OSS
- AstralOS Project
- ❌ Atomic OS
- ❌ AuroraDroid
- AviumUI
- 🟢 AwakenOS
- 🟢 AxionOS
- 🟢 AXP.OS
- AyakaUI
- ❌ BaikalOS
- ❌ BananaDroid
- ❌ BeastROMs
- BenzeneOS
- ❌ Benzo ROM
- ❌ Bianca Project
- 🟢 Black Iron Project
- 🟢 BlissROMs
- ❌ BodyOS
- ❌ Bootleggers ROM
- ❌ BsdkOS
- CaesiumOS
- ❌ CAF Extended
- 🟢 CalyxOS
- 🟢 CandyRoms
- 🟢 Carbon ROM
- 🟢 CatalystOS
- ❌ Cesium OS
- chaoticOS
- CharaROM
- CharlieOS
- 🟢 CherishOS
- 🟢 CipherOS
- ❌ Citrus CAF
- 🟢 Clover
- ❌ ClownUI
- ❌ Colt OS
- ❌ ConquerOS
- CortenaOS
- 🟢 CorvusOS
- ❌ Cosmic OS
- 🟢 crDroid
- ❌ CyanogenMod
- ❌ Cygnus ROM
- ❌ Cypher OS
- DarwinAOSP
- 🟢 DerpFest
- ❌ Descendant X
- ❌ Dirty Unicorns
- ❌ DivestOS
- 🟢 dotOS
- 🟢 DroidX-UI
- 🟢 /e/OS
- Edith-AOSP
- ❌ EliteRoms
- ❌ ElytraOS
- ❌ Eternity OS
- 🟢 EtherealOS
- ❌ euclidOS
- ❌ EunoiaOS
- ❌ Evervolv
- 🟢 Evolution X
- ❌ ExTHmUI
- FeatherOS
- ❌ FeatherROM
- Ferrum OS
- ❌ FireHound
- ❌ Flamingo OS
- ❌ Floko ROM
- Fluent-AOSP
- ❌ Fluid OS
- ❌ Fork LineageOS
- ❌ fortuneOS
- 🟢 Freaky OS
- Frosty
- Fundamental OS
- ❌ Fusion OS
- 🟢 GenesisOS
- ❌ GhostOS
- Good4Nothing-AOSP
- 🟢 GrapheneOS
- Halcyon - Calla Lily
- ❌ Halcyon
- ❌ Halogen OS
- HaloUI
- 🟢 Havoc-OS
- ❌ HentaiOS
- HertzifyOS
- ❌ HyconOS
- Hyper Mint
- HyperArt
- HyperIN
- HyperOS Reborn
- HyperVN
- HyperVoltron
- IchthysOS
- 🟢 iodéOS
- ❌ Ion OS
- ❌ IronOS Project
- ❌ Jaguar ROM
- 🟢 Kali NetHunter
- ❌ Kang OS
- 🟢 Kenvyra
- KleeUI
- ❌ Komodo OS
- ❌ Krypton Open Source Project
- ❌ LeafOS
- ❌ LeaOS
- ❌ LeaOS-OSS
- ❌ Legion OS
- ❌ LessAOSP
- ❌ LightningFastRom
- LightningOS AOSP
- 🟢 LineageOS
- 🟢 LineageOS for microG
- LineageOS x CLO
- LineageOS-Ext
- ❌ Liquid Remix
- ❌ LiquidSmooth
- ❌ LLuvia OS
- ❌ LMODroid
- LOS Modified
- LumineDroid
- 🟢 Lunaris AOSP
- ❌ LunarUI
- ❌ madOS
- ❌ Magnus OS
- ❌ Mallu OS
- 🟢 Project Matrixx
- ❌ MicaOS
- ❌ Miku UI
- ❌ MinusOS
- 🟢 MistOS
- MIUI ONE OS
- MIUI Pro
- MIUI TR
- ❌ MoKee ROM
- ❌ MSM Xtended
- 🟢 Nameless AOSP
- nasgoros
- ❌ NavaDroid
- Neoteric-OS
- NervAOSP
- ❌ Nitrogen OS
- Nucleus OS
- ❌ Nusantara Project
- ❌ Octavi OS
- ❌ Omni ROM
- ❌ OrionOS
- 🟢 PalladiumOS
- 🟢 Paranoid Android
- ❌ PenguinOS
- ❌ PhoenixAOSP
- ❌ Pixel Blaster OS
- ❌ Pixel Dust
- 🟢 Pixel Experience
- PixelBuilds
- 🟢 PixelExtended
- PixelLines
- 🟢 PixelOS
- PixelOS-CLO
- PixelOS-GM
- ❌ PixelPlusUI
- 🟢 PixelStar
- 🟢 PixysOS
- ❌ POSP
- ❌ Project-1CE
- ❌ Project 404
- ❌ Project Arcana
- 🟢 Project Blaze
- Project CiRCLE
- ❌ Project Elixir
- Project Flare
- 🟢 Project Infinity X
- ❌ Project Kaleidoscope
- ❌ Project Kasumi
- 🟢 Project Lighthouse
- ❌ ProjectLisa-AOSP
- ❌ Project Mushroom
- Project Nirwana
- 🟢 Project PixelAge
- ❌ Project Radiant
- 🟢 Project Sakura
- Project Shinkai
- ❌ Project Streak
- ❌ Project Titanium
- ❌ Project Zephyrus
- ❌ ProjectEverest
- ❌ Proton AOSP
- Pulse-OS
- Raven AOSP
- RealizeUI
- 🟢 ReloadedOS
- ❌ Replicant
- ❌ Resurrection Remix OS
- ❌ ResurrectionRemix-Revived
- ❌ Revenge OS
- ❌ RevOS
- ❌ RiceDroid
- 🟢 RisingOS
- ❌ RohieOS
- RuriseOS
- rwiceAOSP
- ❌ Scorpion ROM
- ❌ SerasaOS
- ❌ ShapeShift OS
- ❌ SigmaDroid
- ❌ SkyLineUI
- 🟢 SlimRoms
- 🟢 SomethingOS
- ❌ SoniUI
- ❌ SonyAOSP (SODP)
- 🟢 SparkOS
- ❌ Spice OS
- ❌ Stag OS
- ❌ StatiX OS
- SunOS Project
- 🟢 Superior OS
- ❌ Syberia OS
- ❌ TenXOS
- 🟢 Tequila OS
- The Diva Project
- 🟢 The Kraken Project
- ❌ The Parasite Project
- ❌ The Pixel Project
- ❌ The Styx Project
- ❌ The XPerience Project
- ❌ Tipsy OS
- ❌ Toxyc OS
- ❌ TugaPower
- ❌ UltimateOS
- UOTAN OS
- ❌ UrukDroid
- uwuAOSP
- ❌ Validus OS
- ❌ Viper OS
- ❌ VoidUI
- 🟢 Voltage OS
- ❌ Watchdogs ROM
- 🟢 WaveOS
- ❌ Weeb Projekt
- 🟢 WitAqua
- ❌ Xdroid CAF
- ❌ Xdroid OS
- ❌ Xen AOSP
- ❌ Xenon HD
- ❌ xiaomi.eu
- 🟢 YAAP AOSP
- YAAPex
- ❌ Yukina Supremacy
- 🟢 ZeusOS

## Sources

Provenance and collection status for every ROM we evaluated: where the data
comes from, how fresh it is, and what stopped a source from being implemented.

> Status here is a research snapshot. The **authoritative** list is
> `server/src/ingest/sources.ts` (fetchers) and `server/src/sources/registry.ts`
> (normalizers); upstream attribution lives in `ATTRIBUTION.md`.

### Inclusion Criteria

1. **Installable** - Can be flashed to replace stock ROM
2. **Has device data** - Some form of device list exists

Recoveries, root tools, GSIs/repacks, and OEM stock skins are out of scope: they
are not ROMs with their own device rosters.

### ROMs

#### Implemented

| ROM                  | Base | Project Status  | Data Source             | Notes                                                                                                                                                                                                               |
| -------------------- | ---- | --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2by2 Project         | AOSP | ✅ Active       | ✅ GitHub               | Android 16 `devices.json` unioned with the legacy vendor roster; 5 devices                                                                                                                                          |
| AICP                 | AOSP | ✅ Active       | ✅ GitHub               | Build targets file with device codenames; ~12 active devices on Android 16 (w16.0 branch)                                                                                                                           |
| AfterlifeOS          | AOSP | ✅ Active       | ✅ GitHub               | Single devices.json file with 20+ devices on Android 16                                                                                                                                                             |
| AlphaDroid           | AOSP | ✅ Active       | ⚠️ Website              | `data/devices.json` build index (75 devices) unioned with `devices.md`; 82 devices. Newer builds carry `timestamp` and `os_patch_level`                                                                             |
| ArrowOS              | AOSP | ❌ Discontinued | ✅ GitHub               | Last GitHub push March 2024; device data and code both frozen                                                                                                                                                       |
| AwakenOS             | AOSP | ✅ Active       | ✅ GitHub               | Single devices.json file with 15 devices across Xiaomi, Redmi, OnePlus, realme, Motorola                                                                                                                            |
| AxionOS              | AOSP | ✅ Active       | ✅ GitHub               | `api/downloads.json` from `AxionAOSP/official_devices`; 64 active devices                                                                                                                                           |
| AXP.OS               | AOSP | ✅ Active       | ⚠️ Website              | Sitemap lists one page per supported device (24 device pages); DivestOS successor. `axpos.org` stopped resolving on 2026-11-23 (nameservers unresponsive), so citations point at the `AXP-OS/axpos-org` site mirror |
| Black Iron Project   | AOSP | ✅ Active       | ✅ GitHub               | One `builds/<codename>.json` per device on `z16`; 11 active devices. Two files are malformed JSON and parsed from their raw text                                                                                    |
| BlissROMs            | AOSP | ✅ Active       | ✅ GitHub               |                                                                                                                                                                                                                     |
| CatalystOS           | AOSP | ❌ Discontinued | ✅ GitHub               | `devices.json` on branch 13; 3 active devices                                                                                                                                                                       |
| CherishOS            | AOSP | ✅ Active       | ✅ API                  | API endpoint with 16 devices, last updated Dec 2025; includes recent devices like Xiaomi 13, OnePlus 13                                                                                                             |
| Clover               | AOSP | ✅ Active       | ✅ GitHub               | Single `data/devices.json` file with 20 devices across Poco, Motorola, Nothing, Realme, Redmi, Xiaomi; on Android 16                                                                                                |
| CorvusOS             | AOSP | ❌ Discontinued | ✅ GitHub               | Single devices.json file with 15+ devices; last builds Nov 2022 (vT5.1, Android 13); org last pushed July 2023                                                                                                      |
| crDroid              | AOSP | ✅ Active       | ✅ GitHub API           | Unions every version branch of the official OTA repo (Android 10–16); 302 devices matching crdroid.net. OTA JSON carries `timestamp` and `os_patch_level`                                                           |
| DerpFest             | AOSP | ✅ Active       | ✅ API                  | Device index `derpfest.org/devices-index.json` (134 devices) with display names + latest build; download hosts vary                                                                                                 |
| DroidX-UI            | AOSP | ✅ Active       | ✅ GitHub               | Single devices.json file with 20+ devices across Xiaomi, Nothing, Google, Samsung; last updated July 2025                                                                                                           |
| dotOS                | AOSP | ❌ Discontinued | ✅ GitHub               | Last commit Sept 2022, stuck on Android 12; manifest last pushed Jan 2023; no activity since                                                                                                                        |
| /e/OS                | AOSP | ✅ Active       | ⚠️ Website + GitLab     | Official devices page is the live roster; frozen GitLab CI snapshots remain because that repo is no longer public                                                                                                   |
| Evolution X          | AOSP | ✅ Active       | ✅ GitHub API           | Per-device JSON unioned across release branches (`cnb`/`bka`/`vic`/`udc`); 143 devices; site lists 3 more (`berlin`/`enchilada`/`fajita`) with no build JSON                                                        |
| EtherealOS           | AOSP | ✅ Active       | ✅ GitHub               | A14 `devices.json` (an array); 2 devices. The A13 file is truncated upstream                                                                                                                                        |
| GenesisOS            | AOSP | ✅ Active       | ✅ GitHub               | `devices/DeviceList.json`; 15 maintained devices after dropping `isMaintained: false`                                                                                                                               |
| HavocOS              | AOSP | ❌ Discontinued | ✅ GitHub               | Data from Sept 2023; org last pushed Nov 2023; HavocOS Revived exists but has no device tracking                                                                                                                    |
| iodéOS               | AOSP | ✅ Active       | ⚠️ Website + GitLab API | Official supported-devices table unioned with the GitLab release tree; the tree alone only lists devices with a current build                                                                                       |
| Kali NetHunter       | AOSP | ✅ Active       | ✅ GitLab               | Device kernels YAML with detailed device information and Android versions                                                                                                                                           |
| Kenvyra              | AOSP | ❌ Discontinued | ✅ GitHub               | Device data in Markdown files with YAML frontmatter; 4 devices; org last pushed Feb 2024                                                                                                                            |
| LineageOS            | AOSP | ✅ Active       | ✅ GitHub API           | Device list via GitHub API; newest build per codename from `download.lineageos.org/api/v2/devices/<codename>/builds`, including `os_patch_level`                                                                    |
| LineageOS for microG | AOSP | ✅ Active       | ⚠️ Website              | Official build-host directory index (430 devices); LineageOS rebuild with microG instead of Google apps                                                                                                             |
| Lunaris AOSP         | AOSP | ✅ Active       | ✅ GitHub               | Per-device OTA JSON in `builds/` (45 devices, Android 16.2); active, builds through Sept 2026; JSON carries `timestamp` and `os_patch_level`                                                                        |
| Matrixx              | AOSP | ❌ Discontinued | ✅ GitHub               | Single devices.json file with 30+ devices; org archived Sep 7, 2026                                                                                                                                                 |
| MistOS               | AOSP | ✅ Active       | ✅ GitHub               | Single buildDevices.json file with 25+ devices on Android 16                                                                                                                                                        |
| Nameless AOSP        | AOSP | ❌ Discontinued | ⚠️ Website              | SourceForge file listings for Nameless-AOSP and Nameless-CLO; 34 build targets; rebranded as SunOS Project                                                                                                          |
| PalladiumOS          | AOSP | ❌ Discontinued | ✅ GitHub               | `official_devices.json` on branch 12.1; 13 devices                                                                                                                                                                  |
| Paranoid Android     | AOSP | ✅ Active       | ✅ GitHub               |                                                                                                                                                                                                                     |
| PixelExtended        | AOSP | ✅ Active       | ✅ GitHub               | Per-device OTA JSON in `builds/` (20 devices); maintainer list updated weekly (Nov 2026); device builds still Android 13                                                                                            |
| PixelExperience      | AOSP | ❌ Discontinued | ✅ GitHub               | Upstream shutdown April 2024; org last pushed Apr 2024; committed snapshot is the final state                                                                                                                       |
| PixelOS              | AOSP | ✅ Active       | ✅ GitHub               | Android 17 branch (`seventeen`); one JSON per device under `API/devices/`; 82 devices, one listed with no build yet (`infiniti`)                                                                                    |
| PixelStar            | AOSP | ❌ Discontinued | ✅ GitHub               | `devices.json` on branch 15; 15 active devices (branch 14 marks them inactive)                                                                                                                                      |
| PixysOS              | AOSP | ✅ Active       | ✅ GitHub               | Updater pushed Nov 2026; `official_devices` still last updated Sept 2024, so the roster is stale                                                                                                                    |
| Project Blaze        | AOSP | ❌ Discontinued | ✅ GitHub               | Brand groups in `devices.json` (branch 14); 58 codenames after splitting combined entries and deduplicating                                                                                                         |
| Project Infinity X   | AOSP | ✅ Active       | ✅ GitHub API           | Device JSON files from the Android 16 and 17 branches, unioned; 101 records                                                                                                                                         |
| Project Lighthouse   | AOSP | ❌ Discontinued | ✅ GitHub               | `official_devices.json` on branch sailboat; 25 devices                                                                                                                                                              |
| Project PixelAge     | AOSP | ✅ Active       | ✅ GitHub API           | Individual device JSON files via GitHub API; 15 devices on Android 15, A16 WIP                                                                                                                                      |
| Project Sakura       | AOSP | ✅ Active       | ✅ GitHub               | OTA `devices.json` (Android 16); 2 active devices                                                                                                                                                                   |
| RisingOS             | AOSP | ✅ Active       | ✅ GitHub               | Active upstream: RisingOS-Revived (95 repos, pushes Oct 2026); RisingTechOSS is an Android 14 backup mirror. Device list in official_devices devices.md                                                             |
| SomethingOS          | AOSP | ❌ Discontinued | ✅ GitHub               | `website_devices/devices.json`; 4 devices                                                                                                                                                                           |
| SparkOS              | AOSP | ✅ Active       | ✅ Website              | `spark-os.tech/download` embeds 20 active devices in `__NEXT_DATA__`; the GitHub roster stopped in 2022                                                                                                             |
| Tequila OS           | AOSP | ❌ Discontinued | ✅ GitHub               | `devices.json`; only 1 device is not marked discontinued                                                                                                                                                            |
| WitAqua              | AOSP | ✅ Active       | ✅ GitHub               | `data/devices.json`; 5 devices with download metadata                                                                                                                                                               |
| YAAP AOSP            | AOSP | ✅ Active       | ✅ GitHub               | `<codename>/<codename>.json` in `device-info`; 13 active devices                                                                                                                                                    |
| The Kraken Project   | AOSP | ❌ Discontinued | ✅ GitHub               | `official_devices/devices.json`; 36 devices                                                                                                                                                                         |

#### Not Implemented

| ROM                         | Base      | Project Status  | Data Source | Notes                                                                                                                                    |
| --------------------------- | --------- | --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Afterlife Project           | AOSP      | ❌ Discontinued | ❌ No data  | AOSP Extended fork by AfterLifePrjktAOSP; platform repos frozen Jun 2023; SourceForge release folder only, no device list                |
| AIM ROM                     | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Official device XMLs archived Apr 2020 (~30 devices); core repos last active Nov 2022; site frozen at 2020                               |
| AlrightOS                   | AOSP      | ❌ Discontinued | ❌ No data  | LineageOS fork; alrightos.xyz domain parked; no machine-readable device list                                                             |
| AmogOS Rom                  | AOSP      | ⚠️ Unclear      | ❌ No data  | LMOdroid-based; repos last active Dec 2024; no official device list                                                                      |
| AmyROM                      | AOSP      | ⚠️ Unclear      | ❌ No data  | LineageOS fork; amyrom.ml no longer resolves; no device list                                                                             |
| AncientOS                   | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Single website_api.json file with 70+ devices; data from 2022, last repo update Sept 2023                                                |
| AOKP                        | AOSP      | ❌ Discontinued | ⚠️ Website  | Discontinued after Android 9 (2020); repos inactive since 2022; aokp.co TLS broken; no maintained device roster                          |
| AOSDP                       | AOSP      | ❌ Discontinued | ⚠️ Website  | AOSP-based dark-theme ROM; core GitHub repos last touched 2019, downloads site Aug 2024, no JSON device list.                            |
| AOSiP                       | AOSP      | ❌ Discontinued | ✅ API      | AOSP ROM; devices.json lists ~33 codenames, but code froze 2022 and aosip.dev last updated Jan 2023.                                     |
| AospExtended                | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Suspended indefinitely August 2022; individual device repositories, no centralized device list                                           |
| Aquari OS                   | AOSP      | ❌ Discontinued | ❌ No data  | GitHub org marked "PROJECT NO LONGER ACTIVE"; last builds ~2020 (Android 10); no device list                                             |
| ArfoxOS                     | AOSP      | ⚠️ Unclear      | ❌ No data  | New org (2025); LineageOS-based; OTA repo empty, no published device list                                                                |
| Atomic OS                   | AOSP      | ❌ Discontinued | ⚠️ GitHub   | XDA threads marked discontinued; last builds 2018 (Android 8.1); individual device repos                                                 |
| AuroraDroid                 | AOSP      | ⚠️ Unclear      | ❌ No data  | LineageOS-based v2, repos active Oct 2025; no published device list                                                                      |
| BaikalOS                    | AOSP      | ✅ Active       | ⚠️ Website  | crDroid 16.0 rebrand; branches through Sept 2026; downloads on SourceForge, no machine-readable device list                              |
| BananaDroid                 | AOSP      | ❌ Discontinued | ⚠️ GitHub   | bananadroid.com domain for sale; official_devices repo last updated Mar 2024                                                             |
| BeastROMs                   | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Last builds Aug 2019 (Android 9); per-device repos only, no centralized list                                                             |
| Benzo ROM                   | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Repos last updated May 2023; Pixel device trees only, no centralized device list                                                         |
| Bianca Project              | AOSP      | ❌ Discontinued | ❌ No data  | AOSP/Proton-derived; GitHub org dormant since Dec 2023, no device list or OTA metadata published.                                        |
| BodyOS                      | AOSP      | ⚠️ Unclear      | ❌ No data  | 33 repos; last push Dec 2025; manifest only, no device roster.                                                                           |
| Bootleggers ROM             | AOSP      | ❌ Discontinued | ✅ GitHub   | AOSP (android-13.0.0_r43); code frozen 2023, site Aug 2024; devices.json generated from `_devices` front matter.                         |
| BsdkOS                      | AOSP      | ❌ Discontinued | ❌ No data  | AOSP fork (Project-Fluid base); org dormant since Nov 2021, no device list or OTA data published.                                        |
| CAF Extended                | AOSP      | ❌ Discontinued | ❌ No data  | AOSP+Qualcomm CAF build; last commits Jan–Mar 2022, no machine-readable device list found.                                               |
| CalyxOS                     | AOSP      | ✅ Active       | ⚠️ Website  | Device list on website, includes latest Pixel 9 series and 2024 Motorola devices, requires web scraping                                  |
| CandyRoms                   | AOSP      | ❌ Discontinued | ❌ No data  | AOSP-based; vendor_candy last updated Jul 2024; candyroms.org is now a parked search domain, no device data.                             |
| Carbon ROM                  | AOSP      | ✅ Active       | ⚠️ Website  | AOSP-based; builds dated May 2026 on get.carbonrom.org, but device list is only per-device HTML pages.                                   |
| Cesium OS                   | AOSP      | ❌ Discontinued | ⚠️ Website  | AOSP-based; GitHub org dormant since Jan 2023, device list only on the static website, no JSON.                                          |
| CipherOS                    | AOSP      | ✅ Active       | ⚠️ Website  | AOSP-based, actively committing Dec 2025; current 20-device list only on cipheros.org.in, repo JSON is stale.                            |
| Citrus CAF                  | AOSP      | ❌ Discontinued | ❌ No data  | Org dormant; most repos last touched 2019, latest 2022; only manifest XML, no devices.json/OTA list.                                     |
| ClownUI                     | AOSP      | ⚠️ Unclear      | ❌ No data  | Org bio says "Based on AOSP, WIP"; last commits Dec 2024; no official-devices repo or list.                                              |
| ColtOS                      | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Rebranded as Colt-Enigma; device builds on Android 11 from 2021; individual device JSON files                                            |
| ConquerOS                   | AOSP      | ❌ Discontinued | ❌ No data  | Org archived Apr 2024, last commits Jan 2024; docs/devices/devices.md lists devices but not machine-readable.                            |
| Cosmic OS                   | AOSP      | ❌ Discontinued | ⚠️ Website  | GitHub last activity Apr 2023; site ©2018 Android 8.1; cosmic-os.github.io/devices.html HTML only.                                       |
| CyanogenMod                 | AOSP      | ❌ Discontinued | ⚠️ Website  | Officially shut down December 2016 (10 years ago); succeeded by LineageOS (already implemented)                                          |
| Cygnus ROM                  | AOSP      | ❌ Discontinued | ⚠️ Website  | Last commits May 2023 on caf-13; cygnusos.com/downloadpage.html lists ~10 devices as HTML only.                                          |
| Cypher OS                   | AOSP      | ❌ Discontinued | ❌ No data  | Last commits 2019–2022; cypheros.co; no machine-readable device list found.                                                              |
| Descendant X                | AOSP      | ❌ Discontinued | ❌ No data  | Generic Treble GSI (no per-device list); last commit Sep 25 2020; only manifest/bug_tracker.                                             |
| Dirty Unicorns              | AOSP      | ❌ Discontinued | ❌ No data  | Shut down Mar 2021; repos last touched 2022; dirtyunicorns.com now expired/parked.                                                       |
| DivestOS                    | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Mobile OS discontinued December 2024; device data in shell script arrays (~170 devices), complex parsing                                 |
| EliteRoms                   | MIUI      | ✅ Active       | ⚠️ Website  | v4.09 HyperOS 3.1 A16 releases Sep 2026; linked github.com/elite is unrelated; real site elitedevelopment.com.pk + Telegram.             |
| ElytraOS                    | AOSP      | ⚠️ Unclear      | ❌ No data  | Last commits Jun 2024; only individual device trees (e.g. device_xiaomi_vayu), no devices.json.                                          |
| Eternity OS                 | AOSP      | ⚠️ Unclear      | ❌ No data  | github.com/EternityOS-Plus-Tiramisu returns 404; no verifiable 2026 activity or device list.                                             |
| euclidOS                    | AOSP      | ✅ Active       | ✅ GitHub   | Old euclidTeam org archived Jan 2026, source moved to euclidOS-AOSP (commits to Jun 2026); devices.json maintained.                      |
| EunoiaOS                    | AOSP      | ✅ Active       | ❌ No data  | Repos updated Aug 2026; manifest forks LineageOS lineage-23.2; no public device list found.                                              |
| Evervolv                    | AOSP      | ⚠️ Unclear      | ⚠️ Website  | AOSP mirror repos updated Nov 2025 on v-15.2 (A15) branch, but device builds on site date to ~2021.                                      |
| ExTHmUI                     | AOSP      | ❌ Discontinued | ❌ No data  | Main manifest last updated Sep 2024; exthmui-next code stops Dec 2024; exthmui.cn deprecated; solo maintainer.                           |
| FeatherROM                  | AOSP      | ⚠️ Unclear      | ❌ No data  | 38 repos; last push Aug 2025; SourceForge has no device folders.                                                                         |
| FireHound                   | AOSP      | ❌ Discontinued | ⚠️ Website  | Last repos Nov 2021; Lineage-based (LineageParts/lineage-sdk); only a 2017 website, no device list.                                      |
| Flamingo OS                 | AOSP      | ❌ Discontinued | ❌ No data  | All repos last updated 25 Dec 2022; org states a CLO base; no device list published.                                                     |
| Floko ROM                   | AOSP      | ❌ Discontinued | ⚠️ Website  | Patch README builds from crDroid android 13.0; repo archived Apr 2025; site claims AOSP but base is crDroid.                             |
| Fluid OS                    | AOSP      | ❌ Discontinued | ❌ No data  | Manifest repo is literally marked DISCONTINUED; last commits Aug 2022; no device list.                                                   |
| Fork LineageOS              | AOSP      | ❌ Discontinued | ❌ No data  | Self-described LineageOS fork by HyperTeam; last code Jul 2024; no official_devices repo.                                                |
| fortuneOS                   | AOSP      | ❌ Discontinued | ❌ No data  | AOSP org last commit Dec 2024; successor FortuneOS-CAF (CLO) last active Apr 2025; no device JSON.                                       |
| Freaky OS                   | AOSP      | ❌ Discontinued | ❌ No data  | Manifest last commit Dec 2020 (Android R); site last touched Apr 2023; no device list.                                                   |
| Fusion OS                   | AOSP      | ❌ Discontinued | ⚠️ Website  | Source last updated Feb 2024; official_devices offers only a human-readable devices.md list.                                             |
| GhostOS                     | AOSP      | ❌ Discontinued | ❌ No data  | AOSP/PixelExperience fork; GitHub org tagged "(EOL)", repos last updated Jul 2022.                                                       |
| GrapheneOS                  | AOSP      | ✅ Active       | ⚠️ Website  | Official device list; newest build per codename from `releases.grapheneos.org`; patch level from the `grapheneos.org/releases` changelog |
| Halcyon                     | AOSP      | ✅ Active       | ⚠️ Website  | AOSP; commits Sep 2026, Android 16 Bloom (16.2 in dev); devices documented only on wiki.                                                 |
| Halogen OS                  | AOSP      | ✅ Active       | ⚠️ Website  | AOSP; XOS-16.2 releases Jun 2026 for Nothing Pong/Spacewar; no device-list JSON.                                                         |
| HentaiOS                    | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | AOSP/helluvaOS; last A15 "Vallhound"; officialDevices TOML last commit Jun 2025.                                                         |
| HyconOS                     | AOSP      | ❌ Discontinued | ❌ No data  | AOSP via PixelExperience/RevengeOS; final release v4.5.1 Sep 2021; repos inactive.                                                       |
| Ion OS                      | AOSP      | ❌ Discontinued | ❌ No data  | AOSP/"Pixel Goodies"; org repos all last updated Sep 2, 2020, builds marked EOL 2020.                                                    |
| IronOS Project              | AOSP      | ❌ Discontinued | ❌ No data  | AOSP/ProtonAOSP (A12); manifest last updated Mar 2022, Iron 2.2 Feb 2022.                                                                |
| Jaguar ROM                  | AOSP      | ⚠️ Unclear      | ❌ No data  | XDA-only AOSP build for Xperia XA2 Ultra (2022); no roster.                                                                              |
| Kang OS                     | AOSP      | ❌ Discontinued | ❌ No data  | AOSP/AOKP; repos last updated Aug 2021, final v2.1 "Elixir" Jun 2021.                                                                    |
| Komodo OS                   | AOSP      | ⚠️ Unclear      | ✅ GitHub   | AOSP; v5.0 Varanus (A15) builds Apr–May 2025; last GitHub activity May 2025.                                                             |
| Krypton Open Source Project | AOSP      | ❌ Discontinued | ⚠️ GitHub   | AOSP; org tagged "[EOL]", moved to Flamingo-OS (CLO); repos last updated Jun 2023.                                                       |
| LeafOS                      | AOSP      | ⚠️ Unclear      | ❌ No data  | Repos last pushed Aug 2025; no published device list or downloads (in rework).                                                           |
| LeaOS                       | LineageOS | ✅ Active       | ⚠️ Website  | LineageOS fork for older Huawei/Honor devices; XDA and SourceForge builds.                                                               |
| LeaOS-OSS                   | LineageOS | ✅ Active       | ⚠️ Website  | Open-source LeaOS fork; SourceForge `altairfr-huawei/LeaOS-OSS` plus XDA threads.                                                        |
| LegionOS                    | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Official devices repo last updated Feb 2021 (5+ years old); new org created 2023                                                         |
| LessAOSP                    | AOSP      | ⚠️ Unclear      | ❌ No data  | AOSP; source last pushed Jul 2025, GSI builds Jun 2025; no 2026 activity found.                                                          |
| LMODroid                    | AOSP      | ✅ Active       | ⚠️ Website  | LibreMobileOS ROM brand; device list on website, recent builds (Dec 2025), no machine-readable data                                      |
| LightningFastRom            | AOSP      | ❌ Discontinued | ❌ No data  | LineageOS forks; XDA thread labeled DISCONTINUED; last GitHub activity Feb 2024.                                                         |
| Liquid Remix                | AOSP      | ❌ Discontinued | ⚠️ GitHub   | XDA announced "indefinite hiatus" 2019; org dormant since Jul 2020.                                                                      |
| LiquidSmooth                | AOSP      | ❌ Discontinued | ⚠️ Website  | Discontinued 2016; no machine-readable data, only old XDA forum posts                                                                    |
| LLuvia OS                   | AOSP      | ❌ Discontinued | ❌ No data  | XDA "Based On: AOSP+CAF"; last framework push May 2020, dead since.                                                                      |
| LunarUI                     | AOSP      | ⚠️ Unclear      | ❌ No data  | WIP LineageOS fork, only 3 repos; no activity since Sep 2024, never released.                                                            |
| madOS                       | AOSP      | ❌ Discontinued | ❌ No data  | MediaTek Android Developers; no published roster.                                                                                        |
| Magnus OS                   | AOSP      | ❌ Discontinued | ❌ No data  | Org marked "(EOL)"; README says use LineageOS trees; last activity Jul 2023.                                                             |
| Mallu OS                    | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Org titled "Discontinued", repos archived; Android 10 era, last activity ~2022.                                                          |
| MicaOS                      | AOSP      | ✅ Active       | ❌ No data  | 38 repos; last push Jun 2026; OTA repo covers only Nothing Phone (1), no device roster.                                                  |
| Miku UI                     | AOSP      | ✅ Active       | ⚠️ GitHub   | AOSP; active 2026 (Blooming B4 builds Mar 2026); repos updated Sep 2026.                                                                 |
| MinusOS                     | AOSP      | ✅ Active       | ❌ No data  | 59 repos; last push Jul 2026; manifest only, no device roster.                                                                           |
| MoKee ROM                   | AOSP      | ❌ Discontinued | ⚠️ Website  | Last nightlies Jan 6 2023; GitHub android repo dormant since Dec 2022; download site unreachable.                                        |
| MSM Xtended                 | AOSP      | ❌ Discontinued | ❌ No data  | Development halted Jan 2022; final XT v7.6 (A13) builds mid-2023.                                                                        |
| NavaDroid                   | AOSP      | ⚠️ Unclear      | ❌ No data  | Named in ROM index lists only; no GitHub org, website, or release feed found.                                                            |
| Nitrogen OS                 | AOSP      | ❌ Discontinued | ❌ No data  | Org archived Oct 25 2025; final Pixel 6a A14 work, last activity Jul 2025.                                                               |
| Nusantara Project           | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Site states development inactive; last device update May 2023, repos Dec 2023.                                                           |
| Octavi OS                   | AOSP      | ⚠️ Unclear      | ❌ No data  | Staging org shows WIP commits to Jul 2025; original Octavi-OS org idle since 2022; no device-list repo.                                  |
| OmniROM                     | AOSP      | ❌ Discontinued | ⚠️ Website  | Project officially closed in 2026 (started 2013); website shows "We are closed" announcement                                             |
| OrionOS                     | AOSP      | ❌ Discontinued | ⚠️ GitHub   | README states LineageOS/crDroid base; OTA repo last commit Apr 2025; site orionos.tech/device.                                           |
| The Parasite Project        | AOSP      | ✅ Active       | ⚠️ GitHub   | Active core/frameworks (pushes Jan 2026); device_manifests is a StatiXOS fork, no centralized device list                                |
| PenguinOS                   | AOSP      | ✅ Active       | ✅ GitHub   | `Project-PenguinOS/OTA` publishes machine-readable device data; org pushed Nov 2026; implementable                                       |
| PhoenixAOSP                 | AOSP      | ❌ Discontinued | ❌ No data  | "Phoenix Android 13 ROM"; all repos incl. vendor last updated Dec 2023.                                                                  |
| Pixel Blaster OS            | AOSP      | ❌ Discontinued | ⚠️ Website  | Org says AOSP-based; repos last active Mar 2024; no devices.json found.                                                                  |
| Pixel Dust                  | AOSP      | ❌ Discontinued | ❌ No data  | PixelDust Project X; last device commit Aug 2024, core source idle since ~2021.                                                          |
| PixelPlusUI                 | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Last commit Feb 2023 (3+ years ago), stuck on Android 13; requires fetching 48 individual device JSON files                              |
| The Pixel Project           | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Org archived Mar 5 2026; official_devices has devices.json; last commit Nov 2025.                                                        |
| POSP                        | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | 181+ individual device repositories; last builds 2021-2022 (Android 11/13 era), no centralized device list                               |
| Project-1CE                 | AOSP      | ⚠️ Unclear      | ❌ No data  | 119 repos; last push Nov 2025; per-device repos, no central roster.                                                                      |
| Project 404                 | AOSP      | ✅ Active       | ⚠️ Website  | Manifest and vendor repos updated May 24 2026; AOSP experiments; no JSON list.                                                           |
| Project Arcana              | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Org marked [EOL]; last commits 2022; site lists ~24 devices; AEX-derived.                                                                |
| Project Elixir              | AOSP      | ✅ Active       | ⚠️ Website  | Device list on website with wide manufacturer support; on Android 16, no machine-readable data source                                    |
| ProjectEverest              | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Manifest tracks lineage-21.0; last commits Oct–Nov 2024; per-device JSON files (e.g. X00TD.json).                                        |
| Project Kaleidoscope        | AOSP      | ❌ Discontinued | ⚠️ Website  | Main org repos last updated Oct 14 2024; device trees in Kscope-Devices; no devices.json.                                                |
| Project Kasumi              | AOSP      | ❌ Discontinued | ⚠️ GitHub   | GitHub org archived Apr 2024; last commits Mar 2024; README states LineageOS-based Materium.                                             |
| ProjectLisa-AOSP            | AOSP      | ⚠️ Unclear      | ❌ No data  | 46 repos; last push Dec 2025; manifest only, no device roster.                                                                           |
| Project Mushroom            | AOSP      | ❌ Discontinued | ❌ No data  | Org marked "Deprecated", moved to Miku-UI; last manifest commit Apr 2025; no device list repo.                                           |
| Project Radiant             | AOSP      | ❌ Discontinued | ✅ GitHub   | Last org activity Mar 2024 (web repo); XDA A12 threads tag AOSP; device list is markdown only.                                           |
| Project Streak              | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Last commits Jun 2022; org description redirects to @tequilaOS; only one device OTA file exists.                                         |
| Project Titanium            | AOSP      | ❌ Discontinued | ❌ No data  | Last commits Apr 2020; org description says AOSP-based; no device list repo, website only.                                               |
| Project Zephyrus            | AOSP      | ❌ Discontinued | ❌ No data  | Org archived Feb 2025; last commits Sep 2024; XDA calls it "ProtonKnockOff", mostly Proton-based.                                        |
| Proton AOSP                 | AOSP      | ❌ Discontinued | ⚠️ Website  | Site banner "no longer maintained"; last commit Dec 2022; page lists 6 Pixel codenames, no JSON.                                         |
| ReloadedOS                  | AOSP      | ⚠️ Unclear      | ✅ GitHub   | Site says CAF-based; last commits Jun 2024; device.json in Reloaded-Devices/official_devices.                                            |
| Replicant                   | AOSP      | ⚠️ Unclear      | ⚠️ Website  | Only 8 maintained devices (2010-2013 era Galaxy devices), no machine-readable data source                                                |
| Resurrection Remix OS       | AOSP      | ❌ Discontinued | ✅ API      | Main org last commit Feb 2023; site still advertises RR 8.6 (Android 10); revival fork archived 2025.                                    |
| ResurrectionRemix-Revived   | AOSP      | ❌ Discontinued | ❌ No data  | GitHub org archived 2025-01-04; last commits Aug 2024; resurrectionremix.com stale (Android 10, spam blog).                              |
| Revenge OS                  | AOSP      | ❌ Discontinued | ⚠️ GitHub   | SourceForge last release 2021-10; GitHub commits to Dec 2022; ships per-device maintainers.json.                                         |
| RevOS                       | MIUI      | ❌ Discontinued | ⚠️ Website  | SourceForge RevOS-MIUI last updated 2019-12-23; MIUI custom ROM for Xiaomi; no device JSON.                                              |
| RiceDroid                   | AOSP      | ❌ Discontinued | ❌ No data  | RiceDroid-devices holds device trees only (last push Jan 2023); no OTA repo, device index, or release feed.                              |
| RohieOS                     | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Last manifest commit Jun 2023; official_devices lists only jasmine_sprout (branch 11).                                                   |
| Scorpion ROM                | AOSP      | ❌ Discontinued | ❌ No data  | Last repo activity Feb 2022; scorpionrom.com now offline; manifest credits AOSP, Dirty Unicorns, ABC.                                    |
| SerasaOS                    | AOSP      | ⚠️ Unclear      | ❌ No data  | 87 AOSP repos, last commit Nov 2024; no releases, device list, or public site found.                                                     |
| ShapeShift OS               | AOSP      | ❌ Discontinued | ❌ No data  | Last activity Apr 2024 (Android 13 manifest); shapeshiftos.com JS-only; trees at ShapeShiftOS-Devices.                                   |
| SigmaDroid                  | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Manifest credits crDroid/LineageOS; per-codename OTA JSON; latest commits May–Jul 2025.                                                  |
| SkylineUI                   | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Organization archived Feb 2025; only 2 devices, stuck on Android 13, last builds 2023-2024                                               |
| SlimRoms                    | AOSP      | ❌ Discontinued | ✅ GitHub   | Last release Slim7 2.0 in 2018; site data/devices.json is machine-readable; GitHub to Nov 2021.                                          |
| SoniUI                      | AOSP      | ❌ Discontinued | ❌ No data  | XOSP-Reborn inactive since May 2021; README says org abandoned at Android 12; no device list.                                            |
| SonyAOSP (SODP)             | AOSP      | ⚠️ Unclear      | ❌ No data  | Sony Open Devices AOSP builds; XDA threads, no central roster.                                                                           |
| Spice OS                    | AOSP      | ❌ Discontinued | ⚠️ GitHub   | AOSP, "Under Rebase"; last commits Mar 2023.                                                                                             |
| Stag OS                     | AOSP      | ❌ Discontinued | ⚠️ GitHub   | AOSP 14 (android-14.0.0_r54); last commits Sep 2024; no machine-readable list.                                                           |
| StatiX OS                   | AOSP      | ✅ Active       | ⚠️ GitHub   | Frameworks updated Aug 2026; per-device manifest XML, builds listed 13–16.                                                               |
| SuperiorOS                  | AOSP      | ⚠️ Unclear      | ⚠️ GitHub   | Core repos last updated Jan 2025; requires fetching 70+ individual device JSON files from two repos                                      |
| Syberia OS                  | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Last official build Mar 2024 (v7.1/Android 14); per-device OTA JSON.                                                                     |
| TenXOS                      | AOSP      | ❌ Discontinued | ❌ No data  | LineageOS 21 base; last commits Dec 2024; device list is markdown.                                                                       |
| The Styx Project            | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Pure AOSP (android-15.0.0_r9); repo commits Dec 2024, device org last 2022.                                                              |
| The XPerience Project       | AOSP      | ✅ Active       | ⚠️ GitHub   | CLO/CAF; commits up to Sep 2026; wiki-generated device YAML.                                                                             |
| Tipsy OS                    | AOSP      | ❌ Discontinued | ❌ No data  | SlimRoms-derived (forks); last commits Nov 2020; no device list.                                                                         |
| Toxyc OS                    | AOSP      | ❌ Discontinued | ❌ No data  | AOSP; last commits Nov 2020; no device list or JSON.                                                                                     |
| TugaPower                   | LineageOS | ⚠️ Unclear      | ❌ No data  | LineageOS-based builds; no central roster.                                                                                               |
| UltimateOS                  | AOSP      | ❌ Discontinued | ❌ No data  | AOSP; last commits Sep 2024; official-devices link broken.                                                                               |
| UrukDroid                   | AOSP      | ❌ Discontinued | ❌ No data  | Archos Gen8 Android 2.2 firmware; archived project.                                                                                      |
| Validus OS                  | AOSP      | ❌ Discontinued | ❌ No data  | Dead GZOSP-based ROM; org repos last updated Aug 2020, Android 10 era.                                                                   |
| Viper OS                    | AOSP      | ❌ Discontinued | ⚠️ GitHub   | Discontinued Pie ROM; SourceForge last update 2019-10-27, site still online.                                                             |
| VoidUI                      | AOSP      | ❌ Discontinued | ❌ No data  | Archived Apr 2024; last source push Mar 2024 (Android 14), development abandoned.                                                        |
| VoltageOS                   | AOSP      | ✅ Active       | ⚠️ GitHub   | Text file with codenames only, no device names; requires codename-to-name mapping                                                        |
| Watchdogs ROM               | AOSP      | ⚠️ Unclear      | ❌ No data  | XDA/SourceForge builds for OnePlus devices; no central roster.                                                                           |
| WaveOS                      | AOSP      | ❌ Discontinued | ❌ No data  | EOL after last build Oct 2021; repos last touched Oct 2022, maintainership closed.                                                       |
| Weeb Projekt                | AOSP      | ❌ Discontinued | ❌ No data  | Beta AOSP fork; last commit Aug 2022, SourceForge build Dec 2020.                                                                        |
| Xdroid CAF                  | AOSP      | ❌ Discontinued | ❌ No data  | Superseded CAF variant of xdroidOSS; org's last commit Aug 2023 before move to xdroid-oss.                                               |
| Xdroid OS                   | AOSP      | ✅ Active       | ✅ GitHub   | Reborn Apr 2026 under Nauzyx Labs; org now branded "z0", AOSP repos pushed Jul 2026.                                                     |
| Xen AOSP                    | AOSP      | ⚠️ Unclear      | ❌ No data  | No official GitHub/site or device list found; only the unrelated Linaro xen-aosp hypervisor project                                      |
| Xenon HD                    | AOSP      | ❌ Discontinued | ⚠️ Website  | Dead AOSP/Lineage ROM; last commits Nov 2022, official site stuck on 2018 Pie.                                                           |
| xiaomi.eu                   | MIUI      | ✅ Active       | ⚠️ Website  | Device list in forum thread; community-modified MIUI ROM with multilingual support, requires web scraping                                |
| Yukina Supremacy            | AOSP      | ⚠️ Unclear      | ❌ No data  | Named in ROM index lists only; no upstream repos, website, or release feed found.                                                        |
| ZeusOS                      | AOSP      | ❌ Discontinued | ❌ No data  | Dead Android 11 Lineage-based ROM; core repos last updated 2021 (manifest 2023).                                                         |

### Per-device references

Every edge should cite the **best human-verifiable source** for the claim that
the ROM supports that device. In order of preference:

1. the ROM's own per-device page,
2. a device-specific thread (e.g. an XDA thread),
3. a pinned deep link to the exact file/commit the record came from.

Provenance (the URL a fetcher happened to read) is a tiebreaker, not the
headline: a raw URL is used only when it is itself a good citation.

- **A: URL already in the raw data.** The fetcher receives a device-specific
  URL and it is a citation. A URL is _not_ a citation when it is a contact link
  (Telegram, Discord), a download artifact or store page (`.zip`, pling), a
  maintainer profile, or shared across devices; such a source falls through to
  B, then C, then D. A pure contact field (e.g. `supportgroupurl`) is never
  picked.
- **B: deterministic device page.** A per-device page exists and is derivable
  from the codename. Because the URL is built rather than observed, it is
  recorded as `derived` and must resolve before it is published.
- **C: list-only.** No per-device page; cite a pinned deep link to the exact
  file/commit the record came from.
- **D: no device-specific page.** Cite the source index if one exists and
  record it here as an exception.

Class B is checked by `npm run check:references --workspace server` (part of
`bash scripts/refresh-data.sh`, which commits the result). It probes every
`derived` URL; **404/410 means dead** and the build drops the citation, because
an unverifiable citation is worse than none. 403/429/5xx/timeouts are unknown
and never demote. Results are committed
in `server/reference-overrides.json`; the build consumes them offline. A URL the
source published (`observed`) is evidence on its own and is not re-probed
per URL.

A domain that stops resolving never answers 404, so its citations would stay
forever with every probe reading as unknown. That case is curated, not
automated: a transient resolver failure looks the same as a dead domain, and
one automated verdict would drop every citation on the host at once. Add the
host to `server/reference-blocklist.json` with the date and the DNS evidence.
The build drops derived citations on that host and its subdomains exactly as it
drops a dead URL. The file is edited by hand, so a refresh never rewrites it;
delete the entry when the domain resolves again and the citations return.

These rules are enforced globally by the adapter gate (`isCitation` in
`server/src/sources/adapter.ts`): a raw reference is kept only when it passes
the gate _and_ is unique to one device.

| Source               | Class | Reference                                                                 |
| -------------------- | ----- | ------------------------------------------------------------------------- |
| LineageOS            | A     | `wiki.lineageos.org/devices/<codename>/`                                  |
| LineageOS for microG | B     | `download.lineage.microg.org/<codename>/`                                 |
| AlphaDroid           | B     | `alphadroid.org/#devices?codename=<codename>`                             |
| AXP.OS               | C     | `AXP-OS/axpos-org` `content/devices/<Brand>/<codename>.md`                |
| AxionOS              | B     | `axionos.org/download/<codename>`                                         |
| Nameless AOSP        | C     | SourceForge `files/<codename>/` (AOSP and CLO projects)                   |
| Paranoid Android     | A/C   | `xda_thread`, else pinned `AOSPA/ota` devices file                        |
| PixysOS              | A/B   | `supported_bases[].xda_thread`, else `pixysos.com/<codename>`             |
| Evolution X          | B     | `evolution-x.org/device/<codename>`; `stone` → XDA thread                 |
| BlissROMs            | A/B   | unique `support_thread` (XDA), else `blissroms.org/downloads/<codename>`  |
| Project Infinity X   | B     | `projectinfinity-x.com/downloads/<codename>`                              |
| CherishOS            | B     | `cherishos.com/devices/<codename>`                                        |
| CorvusOS             | C     | pinned `CorvusRom-Devices/jenkins` devices.json (download host dead)      |
| crDroid              | B     | `crdroid.net/<codename>/<major>` (site index), else pinned OTA JSON       |
| DerpFest             | B     | SourceForge `files/<codename>/`, else pinned `devices-index.json`         |
| Lunaris AOSP         | C     | pinned OTA `builds/<codename>.json` (unique thread when present)          |
| PixelExtended        | A/C   | unique `forum_url`/`xda_thread`, else pinned OTA `builds/<codename>.json` |
| Project PixelAge     | C     | SourceForge `files/<codename>/`                                           |
| RisingOS             | C     | pinned `RisingOS-Revived/official_devices` devices.md                     |
| PixelExperience      | B     | `download.pixelexperience.org/<codename>`                                 |
| PixelOS              | B     | `pixelos.net/download/<codename>`                                         |
| Clover               | B     | `thecloverproject.com/download/<codename>`                                |
| dotOS                | B     | `www.droidontime.com/devices/<codename>`                                  |
| /e/OS                | B     | `doc.e.foundation/devices/<codename>`                                     |
| Kenvyra              | B     | `kenvyra.xyz/devices/<codename>/`                                         |
| AICP                 | C     | pinned `vendor_jenkins/aicp-build-targets`                                |
| ArrowOS              | C     | pinned `arrow_infrastructure_devices/arrow.devices`                       |
| Havoc-OS             | C     | pinned `Havoc-OS/Devices` devices file                                    |
| iodéOS               | C     | `iode.tech/iodeos-official-supported-devices` (index)                     |
| Kali NetHunter       | C     | pinned `kali-nethunter-kernels` devices.yml                               |
| AwakenOS             | B     | `awakenos.vercel.app/downloads/<codename>`                                |
| DroidX-UI            | C     | pinned `DroidX-UI-Devices/vendor_droidxOTA` devices.json                  |
| Matrixx              | C     | pinned `Matrixx-Devices/official_devices` devices.json                    |
| AfterlifeOS          | C     | pinned `AfterlifeOS/device_afterlife_ota` devices.json                    |
| MistOS               | C     | pinned `MistOS-Devices/official_devices` buildDevices.json                |
| Black Iron Project   | C     | per-device `OTA/builds/<codename>.json` (z16)                             |
| SparkOS              | C     | pinned `spark-os.tech/download` (`__NEXT_DATA__`)                         |
| YAAP AOSP            | C     | per-device `device-info/<codename>/<codename>.json`                       |
| CatalystOS           | C     | pinned `catalyst-android/OTA` devices.json (branch 13)                    |
| PalladiumOS          | C     | pinned `Palladium-OS/official_devices` official_devices.json (12.1)       |
| PixelStar            | C     | pinned `Project-PixelStar/official_devices` devices.json (branch 15)      |
| Project Blaze        | C     | pinned `ProjectBlaze/official_devices` devices.json (branch 14)           |
| Project Lighthouse   | C     | pinned `lighthouse-os/official_devices` official_devices.json             |
| SomethingOS          | C     | pinned `SomethingOS/website_devices` devices.json                         |
| Tequila OS           | C     | pinned `tequilaOS/tequila_ota` devices.json                               |
| The Kraken Project   | C     | pinned `AOSPK/official_devices` devices.json                              |
| 2by2 Project         | C     | pinned `android_vendor_2by2-ota` and `vendor_2by2-ota` devices.json       |
| EtherealOS           | C     | pinned `Ethereal-Devices` A14 devices.json                                |
| GenesisOS            | C     | pinned `Website-Data` devices/DeviceList.json                             |
| Project Sakura       | C     | pinned `ProjectSakura/OTA` devices.json                                   |
| WitAqua              | C     | pinned `WitAquaOTA` data/devices.json                                     |

### Legend

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

## Triage

Which of the ROMs with no device data have a public, machine-readable roster.
Produced on 2026-11-10 from the catalogue in `server/src/data/roms.ts` and the
source links in
[musabcel/android_rom_list](https://github.com/musabcel/android_rom_list) and
[devadigax/awesome-android-custom-rom](https://github.com/devadigax/awesome-android-custom-rom).

### Method

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

### Current coverage

- 277 catalogue ROMs; 40 have device data, 237 do not.
- Of the 237: 31 active, 103 unknown, 103 discontinued; 168 are already marked
  ❌ in the coverage list and 69 are unevaluated.
- The 31 active ROMs were all previously marked ❌, so this is largely a
  re-check of stale evaluations, not first-time discovery.

Progress: Tier 1, three of the four Tier 2 ROMs and all of Tier 3 are
implemented, taking the catalogue from 40 to 66 ROMs with device data. Project
404 was skipped; see Tier 2.

### Tier 1: active, one clean JSON file

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

### Tier 2: active, a directory of per-device JSON

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

### Tier 3: discontinued, one clean JSON file

Single-file rosters from dormant projects. They still make the ROM page
indexable and add internal links, but the data is historical; prefer the newer
files and treat 2017–2020 snapshots as last-known support.

| ROM                | Devices | File updated | Status      | Source                                                        |
| ------------------ | ------: | ------------ | ----------- | ------------------------------------------------------------- |
| AOSiP              |      34 | 2021-07-21   | Implemented | `AOSiP/api/devices.json`                                      |
| Project Blaze      |      60 | 2024-12-03   | Implemented | `ProjectBlaze/official_devices/devices.json` (branch 14)      |
| SlimRoms           |      54 | 2017-11-05   | Implemented | `slimroms/slimroms.github.io/data/devices.json`               |
| The Kraken Project |      36 | 2022-02-07   | Implemented | `AOSPK/official_devices/devices.json`                         |
| TequilaOS          |       1 | 2024-03-22   | Implemented | `tequilaOS/tequila_ota/devices.json` (34 marked discontinued) |
| Project Lighthouse |      25 | 2022-04-15   | Implemented | `lighthouse-os/official_devices/official_devices.json`        |
| FreakyOS           |      20 | 2020-10-29   | Implemented | `FreakyOS/ota_config/devices.json`                            |
| PalladiumOS        |      13 | 2022-03-31   | Implemented | `Palladium-OS/official_devices/devices/official_devices.json` |
| PixelStar          |      15 | 2024-12-03   | Implemented | `Project-PixelStar/official_devices/devices.json` (branch 15) |
| ReloadedOS         |      12 | 2021-10-01   | Implemented | `ReloadedOS/official_devices/device.json`                     |
| ZeusOS             |       4 | 2021-07-06   | Implemented | `Zeus-OS/website_data/devices.json`                           |
| WaveOS             |       6 | 2021-06-16   | Implemented | `Wave-Project/website-api/devices.json`                       |
| SomethingOS        |       4 | 2024-07-13   | Implemented | `SomethingOS/website_devices/devices.json`                    |
| CatalystOS         |       3 | 2022-11-01   | Implemented | `catalyst-android/OTA/devices.json`                           |
| AIM ROM            |       2 | 2020-04-09   | Implemented | `AIMROM/aimrom.github.io/json/devices.json`                   |

Project Blaze groups its roster by brand, but three Xiaomi devices sit under the
"Nothing" group; the parser corrects them and splits the two entries that pack
several codenames into one string. PixelStar branch 15 is the live roster
(branch 14 marks every device inactive). The 2021-and-older rosters list the
manufacturer in their brand field, so the build resolves the curated vendor
when the model name matches (LG's Nexus 5 is google/hammerhead, not lg/).

### Tier 4: active, roster only in HTML or a site API

No static file: the site renders the list itself or asks an endpoint. These
need a parser per site (or a network trace to find the endpoint) and are more
fragile than the tiers above.

- CarbonROM — implemented from the build index at `get.carbonrom.org`, which
  lists every published build and links a page per device.
- CipherOS — implemented from the schema.org `ItemList` the devices page
  publishes for crawlers.
- VoltageOS — implemented from `VoltageOS/android_vendor_voltageota`, one build
  document per device at the repository root (the 2026-11 scan missed it).
- halogenOS — `halogenos.org/devices` is server-rendered; two devices, so left
  for when the roster is worth a parser.
- LMODroid, StatiXOS — sites did not resolve during the scan.
- Halcyon, Project Elixir, Miku-UI, The XPerience Project, Xdroid, EuclidOS —
  org exists but no roster-shaped file was found; their sites are JS apps.

### Not rosters (avoid)

These parse as device-shaped XML/JSON but are Android build metadata, not
supported-device lists: `EunoiaOS/*/devices.xml` (AOSP emulator config),
`FlokoROM`/`LiquidRemix`/`ResurrectionRemix` `packages_apps_*OTA` `ota.xml`
(app resources), and the per-device `ota.json` files under
`AOSP-Krypton/ota` and `Project-Zephyrus/OTA` (one build each; only useful if
the directory listing is enumerated).

### Tier 5: no public link

87 of the 237 have no GitHub or website in either list. All but seven are
`unknown` or `discontinued`, so they are likely dormant or Telegram-only.
The active ones worth a manual look: LeaOS, LeaOS-OSS, MicaOS, MinusOS,
PenguinOS, The Parasite Project, xiaomi.eu.

### Suggested order

1. Tier 1 (5 ROMs, 30 devices) — done.
2. Tier 2 (3 ROMs, 44 devices) — done; Project 404 skipped as stale.
3. Tier 3 (all 15 ROMs) — done. The 2021-and-older rosters are in as
   last-known support; each project is marked discontinued in the catalogue,
   so the pages state that the list is historical.
4. Tier 4 — CarbonROM, CipherOS and VoltageOS are in (80 mappings). Add the
   rest only where a stable endpoint exists; do not scrape a JS-only site.
5. Leave Tier 5 alone unless a link turns up from another source.

The coverage list still marks several of these ❌. Update it as each ROM is
implemented.

## Evidence

Real requests and observed use that justify a data or access decision. The work
lives in the backlog above; this section keeps the reason, so a later change can be judged
against what someone actually needed rather than against a hunch.

An entry earns its place when it shows intended use, not curiosity: a specific
question the product failed to answer, asked by someone who would act on the
answer. One person is a signal; two independent people asking the same thing is
a pattern. Record the observation and the link, not just the conclusion, and say
what the evidence does not prove.

### Template

```
#### YYYY-MM-DD: short title
- Source: link, and how it surfaced (search, referrer spike, issue, ...)
- Asked for: the question in the asker's terms
- Answered: what the product already covers
- Not answered: the part that stopped short
- Implication: the smallest change that would have answered it
- Limits: who this is, and what it does not establish
- Status: the open item in the backlog above
```

### Entries

#### 2026-11-12: Bootloader unlockability

- **Source**: [@Sans_Google on X](https://x.com/Sans_Google/status/2120618505523306874),
  surfaced by a Twitter referrer spike in Umami (`t.co` and
  `com.twitter.android`).
- **Asked for**: a directory of phones whose bootloader can be unlocked,
  from someone who now buys only unlockable devices and recommends them to
  clients.
- **Answered**: the devices themselves — vendor, model and codename search over
  9,104 devices, with the ROMs available per device.
- **Not answered**: whether a given device's bootloader can be unlocked. The
  reply recommending the site says so outright, for both directories it lists.
- **Implication**: an unlock-status field would make the directory the answer to
  the question that prompted the recommendation, instead of a lookup that stops
  one step short. The referral also landed on the root, so nothing on the entry
  page told the visitor whether the site answers this at all.
- **Limits**: one recommendation, one asker, an audience already fluent in
  custom ROMs. It establishes the question, not the demand volume or which
  vendors matter most.
- **Status**: open item in the backlog above (record bootloader-unlock status per
  device).

#### 2026-11-14: Bootloader unlockability, second source

- **Source**: [@sysodmins post 30428](https://t.me/sysodmins/30428), surfaced by
  a referrer spike in Umami and located by searching public Telegram channel
  histories for `unrom.com`. The first request to unrom.com arrived 14 seconds
  after the post; the channel had 41,022 subscribers and the post ~3.97K views
  at the time of review.
- **Asked for**: which devices can run custom ROMs, and which can be bought
  without risking a locked bootloader. The post recommends unrom.com as an index
  of more than 9,000 models and 277 ROMs, then links a bootloader-unlock
  repository for buyers.
- **Answered**: device, vendor and codename search over 9,104 devices, with the
  ROMs available per device.
- **Not answered**: whether a given device's bootloader can be unlocked.
- **Implication**: record bootloader-unlock status per device. This is the second
  independent recommendation in three days to point at the same gap.
- **Limits**: one large Russian-language channel, not a measured demand study. It
  establishes that the gap is visible to an audience already choosing hardware
  for custom-ROM support, not how many buyers would use the field or which
  vendors matter most.
- **Status**: open item in the backlog above (record bootloader-unlock status per
  device).
