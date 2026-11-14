# unrom server

Node API that turns the raw ROM data in `../data` into a device → ROM index.

> Status: **in progress**: ingest, normalize, build and the read-only REST API
> work end to end, and every registered source is normalized. JSON sources use the
> config-driven adapter in `src/sources/`; irregular shapes have dedicated
> parsers alongside it (LineageOS and Evolution X use a two-stage fetch of
> per-device files; iodéOS is codename-only because its GitLab API is behind an
> anti-bot challenge). `/e/OS` snapshots are **frozen**: its GitLab releases
> repo is no longer publicly readable, so they are no longer re-fetched.
> `src/db/schema.ts` is the source of truth for the tables.

## Pipeline

1. **Ingest**: fetchers in `src/ingest/fetch/` write raw, per-ROM files to
   `../data` (override with `DATA_DIR`). Raw data is the source of truth and is
   never rewritten by the build.
2. **Normalize**: adapters in `src/sources/` parse each source's own shape into
   the canonical `NormalizedRomDevice` records (validated with Zod), written to
   `dist/normalized.ndjson`.
3. **Build DB**: read the normalized records, add the Play catalogue snapshot
   (`data/play-devices.csv`), resolve devices/ROMs, and write
   `dist/unrom.sqlite`. The DDL is generated from `src/db/schema.ts` (the single
   source of truth) and written to `dist/schema.sql` for the exports. Offline
   and reproducible; no network.
4. **Export**: emit `dist/unrom.json` from the DB.
5. **API**: read SQLite only, never fetch at request time.

Fetching and DB-building are separate commands: different failure modes, and
the build step must stay runnable without the network.

```
npm run ingest                       # fetch every source (from repo root)
npm run ingest -- arrowos havocos    # fetch specific sources only
npm run build:data                   # normalize + build SQLite + export JSON
npm run check:references             # record dead derived references
npm run test                         # source coverage + dataset invariants
```

`normalize` fails if any source parses to zero records (unless listed in
`ALLOWED_EMPTY_FILES`), so a changed upstream shape breaks the build instead of
silently dropping data.

`check:references` probes every derived reference URL plus one sample URL per
host. A 404/410 is recorded as dead and the build drops that citation; blocked
or timed-out requests stay unverified and are left in place. Results are written
to `server/reference-overrides.json`. A dead host is reported because every
citation from it needs review.

`dist/` is a derived artifact and is gitignored; `../data` remains the immutable
source of truth.

## Stack

- Node 22.18+ + TypeScript (run directly via type stripping; images pin Node 24)
- Hono (`@hono/node-server`) for the HTTP API
- Drizzle ORM + better-sqlite3 (SQLite)
- Zod for validating normalized records
- REST / JSON

> `better-sqlite3` ships no types and `@types/better-sqlite3` is still on 9.x
> while the runtime is 13.x. The API surface we use is unchanged across those
> versions, so the mismatch is cosmetic; `skipLibCheck` covers it. Revisit (add
> a local `.d.ts` augmentation) if we adopt a v13-only API.

## Tables

| Table             | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `roms`            | One row per ROM/OS (`id`, `name`, `status`)       |
| `devices`         | One row per `(vendor, codename)` device (`name`)  |
| `rom_devices`     | The many-to-many edge (`reference_url`)           |
| `device_variants` | Build targets that cover each other               |
| `registry`        | Curated `(vendor, codename)` names and provenance |
| `aliases`         | Alternate codenames resolving to a device         |
| `meta`            | Snapshot metadata (`generatedAt`, `contentHash`)  |

Search uses `instr` for literal substring matching (`LIKE` would treat `%` and
`_` as wildcards), covers codename, every curated model name, vendor, and
aliases, and ranks devices by variant-inclusive ROM count. An FTS5 index can be
added when the dataset is large enough to need it.

The DB is a **derived artifact**, rebuildable from `../data` at any time, so
the schema can change freely.

## Endpoints

```
GET /api/health                   → { ok: true }
GET /api/meta                     → { generatedAt, contentHash }
GET /api/summary                  → Summary (counts + top devices)
GET /api/brands                   → BrandSummary[]
GET /api/devices?q=&vendor=&letter=&hasRoms=&sort=&limit=&offset=&all=
                                  → BrowseDevice[] + x-total-count
GET /api/devices/letters          → LetterSummary[]
GET /api/devices/:vendor/:codename → DeviceDetail | 404
GET /api/bootloader-policies      → BootloaderPolicy[]
GET /api/bootloader-policies/:vendor → BootloaderPolicy | 404
GET /api/search?q=                → SearchResponse
GET /api/registry?q=&vendor=      → RegistryEntry[]
GET /api/roms                     → RomDetail[] (all catalogued ROMs, incl. 0-device)
GET /api/roms/summary             → RomSummary[]
GET /api/roms/:id                 → RomDetail | 404
GET /api/data                     → Mapping[]
GET /api/openapi.json             → OpenAPI 3.1 document
GET /api/export/json              → dist/unrom.json (attachment)
GET /api/export/sqlite            → dist/unrom.sqlite (attachment)
```

Run it with `npm run dev --workspace server` (watch) or `npm run api` (from the
repo root).
Listens on `127.0.0.1:$PORT` (default 3000); override `PORT`, `DB_PATH`, `OUT_DIR`.

The API response shapes are frozen in the shared `@unrom/contract` workspace
(`../contract`), which both this server and the web client import. The web
client targets that contract, so the frontend can be built against mock data
and switched over later.

## Export

Generated by `npm run build:data` into `dist/`:

- **SQLite**: `dist/unrom.sqlite` (single file; zip adds nothing).
- **JSON**: `dist/unrom.json`, compressed at the transport layer
  (`Content-Encoding: gzip`), not shipped as a `.zip`. Browsers decode it
  transparently.
- A `.zip` bundle is only for shipping multiple artifacts together
  (`unrom.sqlite` + `LICENSE` + `ATTRIBUTION` + `schema.sql`).
- Both exports carry the snapshot timestamp (`meta.generatedAt`).

Both files are served by the API as attachments
(`GET /api/export/json`, `GET /api/export/sqlite`) and linked from the web
header menu and the `/data` page.

## License

- **Code**: AGPL-3.0-only ([`../LICENSE`](../LICENSE)).
- **Data & exports**: ODbL-1.0 ([`../DATA_LICENSE`](../DATA_LICENSE)); source
  attribution in [`../ATTRIBUTION.md`](../ATTRIBUTION.md).
- Contributions are accepted under those terms and require a DCO sign-off
  ([`../DCO`](../DCO), [`../CONTRIBUTING.md`](../CONTRIBUTING.md)).
