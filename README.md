# unrom

The open database for device–ROM compatibility.

unrom tracks which custom Android ROMs support which devices, and makes that
data available through an API and a web app. It is judged by two things only:
**data quality** (accurate, complete, current, deduplicated, with provenance)
and **data accessibility** (available via the API, viewable in the web app, and
exportable).

## Repository

| Path | What |
| --- | --- |
| `data/` | Raw per-source snapshots (source of truth, not hand-edited) |
| `server/` | Pipeline (ingest → normalize → SQLite) and the REST API |
| `web/` | React Router SSR app that views the data |
| `contract/` | Shared, type-only API DTOs |
| `deploy/` | Container + reverse-proxy deployment |

## Self-hosting

Requires Docker with the compose plugin.

```sh
docker compose -f deploy/compose.yaml up -d --build
```

This builds the database + exports from `data/` (the `data` service), then runs:

- **API** — `http://127.0.0.1:3000`
- **Web** — `http://127.0.0.1:3001`

Both are bound to localhost; put a reverse proxy in front. An optional Caddy is
included:

```sh
docker compose -f deploy/compose.yaml --profile proxy up -d --build
```

See `deploy/Caddyfile` for the routes (`/api/*` → API, everything else → web).

### Refreshing the data

```sh
# Rebuild the database/exports from the existing raw snapshots
docker compose -f deploy/compose.yaml run --rm data

# Or fetch fresh snapshots first (network), then rebuild
docker compose -f deploy/compose.yaml run --rm data npm run ingest --workspace server
docker compose -f deploy/compose.yaml run --rm data
```

### Without Docker

Node 24+:

```sh
npm install
npm run build:data   # normalize + build SQLite + export JSON
npm run api          # API on :3000
npm run build        # web build (SSR)
npm run start --workspace web   # web on :3001
```

Environment variables are documented in `.env.example`.

## API

```
GET /api/health                   → { ok: true }
GET /api/meta                     → { generatedAt, deviceCount, romCount, edgeCount }
GET /api/devices?q=               → BrowseDevice[]
GET /api/devices/:codename        → DeviceDetail | 404
GET /api/roms                     → RomDetail[]
GET /api/roms/:id                 → RomDetail | 404
GET /api/data                     → Mapping[]
GET /api/export/json              → unrom.json (attachment)
GET /api/export/sqlite            → unrom.sqlite (attachment)
```

Response shapes are frozen in `contract/`.

## License

- **Code** — AGPL-3.0-only ([`LICENSE`](./LICENSE)).
- **Data & exports** — ODbL-1.0 ([`DATA_LICENSE`](./DATA_LICENSE)); upstream ROM
  data keeps its own terms. See [`ATTRIBUTION.md`](./ATTRIBUTION.md).
- Contributions require a DCO sign-off ([`DCO`](./DCO), [`CONTRIBUTING.md`](./CONTRIBUTING.md)).
