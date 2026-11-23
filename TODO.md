# TODO

- [ ] Grow indexable content by adding source-backed device data for ROMs that
      currently have none. Tiers 1–3 are implemented and three Tier 4 rosters
      are in (66 of 277 ROMs now have data; Project 404 was skipped as stale).
      What remains is the rest of Tier 4, where the roster only exists in HTML
      or a JS app, and Tier 5, which has no public link; see `ROM_TRIAGE.md`.
- [ ] Record bootloader-unlock status per device. The demand is logged in
      `USER_EVIDENCE.md` (2026-11-12 and 2026-11-14): two independent
      recommendations name the site and then point readers to bootloader-unlock
      information. Search already covers vendor, model and codename, so the gap
      is coverage, not discovery. Open questions: one field or a
      tri-state (unlockable / locked / unknown); an authoritative per-vendor
      source for each; whether it belongs in `contract/` (a versioning
      decision); and how to validate 9,103 devices rather than assume them.
      Interim: state on the devices page what the directory does and does not
      claim. Vendor-level policies cover seven vendors; add one only when it
      publishes a policy (Samsung and ASUS next, then regional variants).
- [ ] Record the per-device facts a "which build for this device" filter needs,
      each with a source: relock / verified-boot support (a different question
      from whether the vendor allows unlocking), vendor support end date (which
      also gives EOL / legacy), and official versus unofficial build (see the
      item below). Relock is recorded per pair from project statements, and the
      newest build date and patch level from five sources. Collect the support
      end date and the build kind before `/devices`
      offers these as filters; then the devices menu can link to a few presets
      instead of listing seven groups. "Hardened" is not a facet until it is
      defined as checkable predicates — patch level, relock, support end — not a
      label.
- [ ] Add the remaining device groups. Hardened, relock supported, recently
      updated and with ROMs have dedicated pages under `/device-groups`, and
      the menu links to them. Long support (vendor support end five years out),
      legacy (support ended) and official builds stay blocked by the data item
      above. Each group is a property of the device–ROM pair, so a pair may
      appear in several.
- [ ] Record whether a ROM's builds are reproducible. A source host is now
      recorded for the ROMs whose code host is verified (`rom-sources.ts`, shown
      as "Project source" on the ROM page); the remaining projects have no
      source URL yet, mostly the ones whose roster is a website. Reproducibility
      is the other half of "can I check this": GrapheneOS publishes it, most
      projects do not, so add the flag when there is a way to state it per
      project rather than a project-wide assumption.
- [ ] Separate official from unofficial builds per device–ROM mapping. Some
      sources publish it (DerpFest's `romtype`), most do not; where it exists it
      answers whether a device runs the project's own build or a maintainer's.
      Coverage headlines currently mix both.
- [ ] Record build freshness per ROM: last build date and last commit, with a
      stale flag (6/12/24 months). `status` only says whether a project ships
      anything at all; AOSPA is "active" on an Android 14 build. The build date
      and the patch level that build reports are now on the mapping for the five
      sources that publish them (784 of 3702 mappings have a date, 484 a patch
      level). Still open: the last commit per project, the stale flag, and the
      sources whose snapshots already carry timestamps but are not wired up
      (Evolution X, DerpFest, PixelOS, SuperiorOS, WitAqua, PixelExtended,
      Project PixelAge, CandyRoms).
- [ ] Record the Android version per device–ROM pair. `os_sdk_level` and the
      release string sit in the same OTA metadata as the build date, which is
      now recorded; the version is not.
- [ ] Write a methodology page for the confidence model: verified, inferred,
      manual and unverified names, observed versus derived references, what
      "verified" covers, and what is refreshed when.
- [ ] Show `referenceKind` on device rows once the methodology page explains it.
      Most mappings are derived; the API knows which and the page does not say.
- [ ] Check `observed` reference URLs on a schedule. Derived ones already run in
      `check:references`; a sampled observed link (DerpFest/sunfish) was dead and
      nothing noticed. A dead citation is a false claim.
- [ ] Publish a diff between builds: what changed since the last one. The
      content hash already changes; humans cannot see why.
- [ ] Merge duplicate ROM identities (AfterlifeOS and Afterlife Project, AOSPA
      and Paranoid Android, crDroid and crDroid X). Deduplication is part of
      data quality, not polish.
