# TODO

- [x] ~~Check the component for the "All brands" and "Any ROM count" buttons. They don't feel very polished. Make sure to use shadcn as much as possible.~~
      Retired: those were native `<select>`s in `DevicesDirectory.tsx`, removed in
      `40b9ba3` when devices moved to search + A–Z letter pages. Search is the
      filtering path now, so there is no component left to polish.
- [ ] Grow indexable content by adding source-backed device data for ROMs that
      currently have none. Tiers 1, 2 and the recent half of Tier 3 are
      implemented (56 of 277 ROMs now have data; Project 404 was skipped as
      stale). Next are the 2021-and-older rosters in `ROM_TRIAGE.md`.
- [x] ~~Serve `/api` from the standalone web server, or document that it needs a
      reverse proxy. `npm run start --workspace web` cannot reach `/api`
      without Caddy, so the built app is not self-contained.~~
      Done: `web/server.ts` proxies `/api` to `API_URL`, so the standalone web
      server is self-contained.
- [x] ~~Keep the detail-page tables usable without JavaScript. `renderAllRows`
      already puts every filtered row in the initial HTML, so crawlers see the
      full set, but rows past the first page carry `hidden`, and sorting,
      filtering and pagination are still client-only controls.~~
      Done: a `<noscript>` rule reveals every row and hides the toolbar and
      pager, so the whole table is readable without scripts; sorting and
      filtering are no longer needed to reach a row.
- [ ] Put table state (sort, filter, hidden columns, page) in the URL so a view
      can be shared and survives back/forward navigation.
- [x] ~~Remove the dark-theme flash on first paint by applying the stored theme
      before React hydrates.~~
      Retired: first-paint polish. It changes no data, access path or URL, so
      it is out of scope under the project rule.
- [x] ~~Redirect trailing-slash URLs to the canonical no-slash form. Both
      currently return 200, creating duplicate self-canonical URLs.~~
      Done: `web/server.ts` answers any non-root trailing-slash path with a
      308 to the no-slash form, preserving the query string.
- [x] ~~Give the generic error page a retry action. It already offers Back home
      and browse links (so it is no longer a dead end), but it cannot re-run
      the failed request.~~
      Done: non-404 errors render a "Try again" button that revalidates the
      route.
- [x] ~~Announce table filter result counts with `aria-live` so screen-reader
      users know the row set changed.~~
      Done: the row count in `DataTablePagination` is a polite live region.
- [x] ~~Decide whether `/api/devices` should have a bounded default. Without
      `limit` it returns the full filtered list (documented behaviour), which
      is costly for casual clients; a default page plus an explicit all-rows
      opt-in would be safer.~~
      Done: it defaults to 100 rows; `all=true` returns the full filtered
      list, and the devices sitemap is the only consumer that asks for it.
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
