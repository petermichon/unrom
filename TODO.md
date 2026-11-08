# TODO

- [x] ~~Check the component for the "All brands" and "Any ROM count" buttons. They don't feel very polished. Make sure to use shadcn as much as possible.~~
      Retired: those were native `<select>`s in `DevicesDirectory.tsx`, removed in
      `40b9ba3` when devices moved to search + A–Z letter pages. Search is the
      filtering path now, so there is no component left to polish.
- [ ] Grow indexable content by adding source-backed device data for ROMs that
      currently have none. Deferred: this needs one adapter per ROM, and many
      catalogue entries have no usable public device list.
- [x] ~~Serve `/api` from the standalone web server, or document that it needs a
      reverse proxy. `npm run start --workspace web` cannot reach `/api`
      without Caddy, so the built app is not self-contained.~~
      Done: `web/server.ts` proxies `/api` to `API_URL`, so the standalone web
      server is self-contained.
- [ ] Keep directory tables usable without JavaScript. Sorting, filtering and
      pagination are client-side, so the controls are inert with scripts
      disabled; render the full table or paginate on the server.
- [ ] Put table state (sort, filter, hidden columns, page) in the URL so a view
      can be shared and survives back/forward navigation.
- [ ] Remove the dark-theme flash on first paint by applying the stored theme
      before React hydrates.
- [ ] Redirect trailing-slash URLs to the canonical no-slash form. Both
      currently return 200, creating duplicate self-canonical URLs.
- [ ] Give the generic error page a retry action instead of a dead end.
- [ ] Announce table filter result counts with `aria-live` so screen-reader
      users know the row set changed.
- [ ] Decide whether `/api/devices` should have a bounded default. Without
      `limit` it returns the full filtered list (documented behaviour), which
      is costly for casual clients; a default page plus an explicit all-rows
      opt-in would be safer.
