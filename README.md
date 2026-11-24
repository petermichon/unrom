# unrom

Open database for device–ROM compatibility.

unrom tracks which custom Android ROMs support which devices. **The product is
access to that data**, through an API, a web app and exports — and through any
other surface that carries it further. It is judged on two things: whether the
data is **trustworthy** (accurate, complete, current, deduplicated, with
provenance) and whether access to it is **broad and usable** (via the API, in the
web app, exportable).

## Repository

| Path        | What                                                        |
| ----------- | ----------------------------------------------------------- |
| `data/`     | Raw per-source snapshots (source of truth, not hand-edited) |
| `server/`   | Pipeline (ingest → normalize → SQLite) and the REST API     |
| `web/`      | React Router SSR app that views the data                    |
| `contract/` | Shared, type-only API DTOs                                  |
| `deploy/`   | Container + reverse-proxy deployment                        |

## Self-hosting

Requires Docker with the compose plugin.

```sh
docker compose -f deploy/compose.yaml up -d --build
```

This builds the database + exports from `data/` (the `data` service), then runs:

- **API**: `http://127.0.0.1:3000`
- **Web**: `http://127.0.0.1:3001`

Both are bound to localhost; put a reverse proxy in front. An optional Caddy is
included:

```sh
docker compose -f deploy/compose.yaml --profile proxy up -d --build
```

See `deploy/Caddyfile` for the routes (`/api/*` → API, everything else → web).

### Refreshing the data

Normal flow: fetch, rebuild and validate locally, then review and commit the
snapshot diff. `npm run refresh` runs the same wrapper the scheduler uses, with
commit and push turned off, so there is one refresh implementation.

```sh
npm run refresh        # ingest → build → verify → check sources → prints changed files
git diff --stat data/  # review what the sources changed
git add data/ server/reference-overrides.json server/source-health.json
git commit -s -m "chore(data): refresh source snapshots"
git push               # images.yml builds and freshdock deploys
```

It exits non-zero while a source is stale or unreachable, even though everything
that did refresh was built and validated. The finding names the source, the last
success and the last error, so a source that has been down for a week cannot pass
for a project that stopped shipping builds.

Or rebuild from the existing snapshots without touching the network:

```sh
docker compose -f deploy/compose.yaml run --rm data
```

#### Unattended refresh

`scripts/refresh-data.sh` is the wrapper for cron, a systemd timer or a remote
job. Nothing installs it; schedule it yourself:

```sh
bash scripts/refresh-data.sh             # pull, ingest, build, verify, commit, push
bash scripts/refresh-data.sh --no-push   # commit locally only
bash scripts/refresh-data.sh --no-commit # refresh and report, touch no git state
```

It refuses a dirty tracked tree unless `--no-commit` is given, tolerates partial
source failures, and commits only `data/`, `server/reference-overrides.json` and
`server/source-health.json`. Partial ingest still has to pass the build and
`npm run verify` before anything is committed. Pushes must come from `main`, and
git identity must be configured because commits are signed off.

`check:sources` runs after `verify` and compares `server/source-health.json` with
the registry: a source whose last attempt failed, or whose last success is older
than `SOURCE_MAX_AGE_DAYS` (7 by default), makes the run exit non-zero after the
commit and push. A dead host is therefore reported on the next scheduled run
instead of being discovered weeks later, while the data that did refresh still
ships.

Example schedule (not installed by the repo):

```cron
17 3 * * * cd /srv/unrom && bash scripts/refresh-data.sh >>/var/log/unrom-refresh.log 2>&1
```

`flock` is used when available so overlapping runs exit instead of racing.

Each build also writes `server/dist/registry-report.json`: source-reported names
for uncurated devices (candidates), conflicts where sources disagree, and
per-vendor coverage. Use it to grow the curated registry incrementally:

```sh
npm run registry:suggest            # list vendors with candidate counts
npm run registry:suggest -- asus    # paste-ready entries for one vendor
```

### Production (image publishing)

- **Images** (`.github/workflows/images.yml`): on pushes to `main` (docs-only
  changes are skipped) and manual runs, builds and publishes
  `ghcr.io/<owner>/unrom-api` and `unrom-web` tagged with the commit SHA and
  `latest`. Tests and typechecks run in CI (`.github/workflows/ci.yml`); run
  `npm run verify` locally, or `npm run verify:all` to include the browser
  suite.
- **Deploy is pull-based**: the server runs [freshdock](https://github.com/Turbootzz/freshdock)
  (`--profile deploy`), which recreates `api`/`web` when a new image is
  published. No SSH credentials or inbound access; healthchecks gate updates and
  roll back a broken image. `git pull` is only needed when the compose file or
  Caddyfile changes.
- **Refresh data**: `npm run refresh` for the reviewed local flow, or
  `scripts/refresh-data.sh` when scheduled. Pushes to `main` build and deploy the
  images; there is no GitHub refresh job.

Server bootstrap:

```sh
git clone https://github.com/petermichon/unrom.git /srv/unrom
cd /srv/unrom
docker compose -f deploy/compose.yaml --profile proxy --profile deploy up -d --build
```

Rollback: change the tag and restart:
`UNROM_TAG=<previous-sha> docker compose -f deploy/compose.yaml --profile proxy --profile deploy up -d`.

### Without Docker

Node 22.18+ (24 recommended, see `.nvmrc`):

```sh
npm install
npm run build:data   # normalize + build SQLite + export JSON
npm run api          # API on :3000
npm run build        # web build (SSR)
npm run start --workspace web   # web on :3001
```

Environment variables are documented in `.env.example`. The web server proxies
`/api` to `API_URL` (default `http://127.0.0.1:3000`), so it needs no reverse
proxy to serve the app.

## API

```
GET /api/health                   → { ok: true }
GET /api/meta                     → { generatedAt, contentHash }
GET /api/devices?q=&vendor=&letter=&hasRoms=&sort=&limit=&offset= → BrowseDevice[] (x-total-count)
GET /api/search?q=                → SearchResponse
GET /api/devices/:vendor/:codename → DeviceDetail | 404
GET /api/bootloader-policies      → BootloaderPolicy[]
GET /api/bootloader-policies/:vendor → BootloaderPolicy | 404
GET /api/registry?q=&vendor=      → RegistryEntry[]
GET /api/roms                     → RomDetail[]
GET /api/roms/summary             → RomSummary[] (counts only)
GET /api/roms/:id                 → RomDetail | 404
GET /api/data                     → Mapping[]
GET /api/export/json              → unrom.json (attachment)
GET /api/export/sqlite            → unrom.sqlite (attachment)
```

Response shapes are frozen in `contract/`.

## License

- **Code**: AGPL-3.0-only ([`LICENSE`](./LICENSE)).
- **Data & exports**: ODbL-1.0 ([`DATA_LICENSE`](./DATA_LICENSE)); upstream ROM
  data keeps its own terms. See [`ATTRIBUTION.md`](./ATTRIBUTION.md).
- **Trademarks**: Android is a trademark of Google LLC. All other product
  names, logos, and brands are property of their respective owners and are used
  for identification purposes only. unrom is not affiliated with or endorsed by
  any of them.
- Contributions require a DCO sign-off ([`DCO`](./DCO), [`CONTRIBUTING.md`](./CONTRIBUTING.md)).
