# TODO

- [ ] Record bootloader-unlock status per device. The demand is logged in
      `USER_EVIDENCE.md` (2026-11-12 and 2026-11-14): two independent
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
      defined as checkable predicates — patch level, relock, support end — not a
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
- [ ] Record whether a ROM's builds are reproducible. A source host is now
      recorded for 52 of the 274 ROMs (`rom-sources.ts`, shown as "Project
      source" on the ROM page); the rest are mostly projects whose roster is a
      website. Reproducibility is the other half of "can I check this":
      GrapheneOS publishes it, most projects do not, so add the flag when it can
      be stated per project rather than assumed.
- [ ] Record the last commit per project, completing the freshness picture.
      The build date is now on every mapping whose roster publishes a
      timestamp, and an active project whose newest build is over a year old is
      labelled. The last commit needs a repository URL per project, not just the
      organisation `rom-sources.ts` holds, and GitHub allows 60 unauthenticated
      API requests an hour, so it needs a token or a committed snapshot.
- [ ] Record the Android version per device–ROM pair. `os_sdk_level` and the
      release string sit in the same OTA metadata as the build date, which is
      now recorded; the version is not, and it covers only 135 mappings today.
- [ ] Check `observed` reference URLs on a schedule. Derived ones already run
      in `check:references`; a sampled observed link (DerpFest/sunfish) was dead
      and nothing noticed. A dead citation is a false claim.
- [ ] Publish a diff between builds: what changed since the last one. The
      content hash already changes; humans cannot see why. Needs build history,
      which the pipeline does not keep today.
