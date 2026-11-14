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
      decision); and how to validate 9,104 devices rather than assume them.
      Interim: state on the devices page what the directory does and does not
      claim.
- [ ] Record a source URL per ROM, and later whether its builds are
      reproducible. The dataset says which devices a ROM supports but not where
      its code lives or whether anyone can verify the binaries, so "can I check
      this" has no answer yet. Both facts are checkable per project (the org
      plus manifest, e.g. `github.com/DerpFest-AOSP/android_manifest`;
      reproducible builds, which GrapheneOS publishes and most projects do
      not), so they belong in the data rather than in an argument. Source URLs
      cover most of the 277 ROMs and would be a `contract/` addition; the
      verification flag can wait until there is something to record.
