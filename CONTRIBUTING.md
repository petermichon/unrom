# Contributing

Thanks for helping make unrom the most accurate device ↔ ROM compatibility
source. Data and API come first; the frontend is a neutral access layer.

## Licensing of contributions

By contributing, you agree that:

- **Code** (everything outside `data/`) is licensed under **AGPL-3.0-only**
  (see [`LICENSE`](./LICENSE)).
- **Data** (the compiled database, exports, and the records derived from
  `data/`) is licensed under **ODbL-1.0** (see [`DATA_LICENSE`](./DATA_LICENSE)).

Upstream ROM data keeps its own terms; we can only license our compilation.
Every source must be recorded in [`ATTRIBUTION.md`](./ATTRIBUTION.md).

## Developer Certificate of Origin

All commits must be signed off under the [Developer Certificate of Origin
1.1](./DCO). Sign off with:

```
git commit -s
```

This adds a `Signed-off-by: Your Name <you@example.com>` trailer certifying you
have the right to submit the contribution under the project's licenses.

## Adding or fixing a source

1. **Raw data** lives in `data/`, one file per source, written by a fetcher in
   `server/src/ingest/fetch/` and registered in `server/src/ingest/fetch-all.ts`.
2. **Normalizers** in `server/src/sources/` map a source's shape into the
   canonical `NormalizedRomDevice` record; register them in the source registry.
3. Keep `data/` immutable — never hand-edit it; change the fetcher instead.
4. Add the source to `ATTRIBUTION.md`.

## Before opening a PR

```sh
npm run check       # typecheck all workspaces
npm run build:data  # normalize + build SQLite + export JSON
```

Report wrong mappings via an issue rather than editing generated artifacts.
