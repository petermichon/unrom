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
      three of four engines. The page that fits this dataset is a router — pick
      the device, then follow that ROM's own instructions — never invented
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

## Parked

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
