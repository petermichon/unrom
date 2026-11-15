# TODO

- [ ] Grow indexable content by adding source-backed device data for ROMs that
      currently have none. Tiers 1, 2 and the recent half of Tier 3 are
      implemented (56 of 277 ROMs now have data; Project 404 was skipped as
      stale). Next are the 2021-and-older rosters in `ROM_TRIAGE.md`.
- [ ] Put table state (sort, filter, hidden columns, page) in the URL so a view
      can be shared and survives back/forward navigation.
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
- [ ] Record a source URL per ROM, and later whether its builds are
      reproducible. The dataset says which devices a ROM supports but not where
      its code lives or whether anyone can verify the binaries, so "can I check
      this" has no answer yet. Both facts are checkable per project (the org
      plus manifest, e.g. `github.com/DerpFest-AOSP/android_manifest`;
      reproducible builds, which GrapheneOS publishes and most projects do
      not), so they belong in the data rather than in an argument. Source URLs
      cover most of the 277 ROMs and would be a `contract/` addition; the
      verification flag can wait until there is something to record.
- [ ] Separate official from unofficial builds per device–ROM mapping. Some
      sources publish it (DerpFest's `romtype`), most do not; where it exists it
      answers whether a device runs the project's own build or a maintainer's.
      Coverage headlines currently mix both.
- [ ] Record build freshness per ROM: last build date and last commit, with a
      stale flag (6/12/24 months). `status` only says whether a project ships
      anything at all; AOSPA is "active" on an Android 14 build. The build date
      and the patch level that build reports are now on the mapping for the four
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
