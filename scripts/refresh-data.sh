#!/usr/bin/env bash
# Refresh the source snapshots and publish them only if the data changed.
#
# This is repository code, not an installer: it does not create cron jobs,
# systemd units or credentials. Run it manually, or schedule it externally:
#
#   bash scripts/refresh-data.sh              # pull, refresh, commit, push
#   bash scripts/refresh-data.sh --no-push    # commit locally only
#   bash scripts/refresh-data.sh --no-pull    # use the checkout as-is
#   bash scripts/refresh-data.sh --no-commit  # refresh and report, change nothing in git
#
# Requires a clean tracked working tree unless --no-commit, and a git identity
# configured when it commits (the commit is signed off). Partial source failures
# are expected; snapshots that did refresh are still built, tested and published.
# Nothing is committed if the build or tests fail.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: bash scripts/refresh-data.sh [--no-pull] [--no-push] [--no-commit]

  --no-pull     Do not run `git pull --rebase` first.
  --no-push     Commit refreshed snapshots locally, but do not push.
  --no-commit   Refresh, build, validate and report without touching git
                (implies --no-push; `npm run refresh` uses this).
  -h, --help    Show this message.
EOF
}

do_pull=1
do_push=1
do_commit=1
for arg in "$@"; do
  case "$arg" in
    --no-pull) do_pull=0 ;;
    --no-push) do_push=0 ;;
    --no-commit)
      do_commit=0
      do_push=0
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

cd "$(git rev-parse --show-toplevel)"

# One refresh at a time, even if the scheduler fires again before this finishes.
if command -v flock >/dev/null 2>&1; then
  exec 9>"${TMPDIR:-/tmp}/unrom-refresh.lock"
  if ! flock -n 9; then
    log "another refresh is already running; exiting"
    exit 0
  fi
fi

# Only publish from a known-clean checkout. Untracked files are left alone.
# A local refresh (--no-commit) runs against whatever the working tree holds.
if [ "$do_commit" = 1 ] && [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  log "tracked working tree is dirty; refusing to refresh"
  exit 1
fi

branch="$(git symbolic-ref --quiet --short HEAD || true)"
if [ "$do_push" = 1 ] && [ "$branch" != "main" ]; then
  log "refusing to push from '${branch:-detached HEAD}'; expected main"
  exit 1
fi

if [ "$do_pull" = 1 ]; then
  log "pulling $branch"
  if ! git pull --rebase; then
    log "pull failed; resolve the checkout and retry"
    exit 1
  fi
fi

ingest_log="$(mktemp "${TMPDIR:-/tmp}/unrom-ingest.XXXXXX")"
trap 'rm -f "$ingest_log"' EXIT

log "fetching source snapshots"
set +e
npm run ingest 2>&1 | tee "$ingest_log"
ingest_status=${PIPESTATUS[0]}
set -e

refreshed="$(grep -c '^✓' "$ingest_log" || true)"
failed="$(grep -c '^✗' "$ingest_log" || true)"
log "ingest finished: ${refreshed} refreshed, ${failed} failed"

if [ "$ingest_status" -ne 0 ]; then
  if [ -z "$(git status --porcelain -- data/)" ]; then
    log "ingest failed and no snapshots changed; aborting"
    exit 1
  fi
  log "ingest had failures; publishing the snapshots that did refresh"
fi

log "checking derived reference URLs"
references_log="$(mktemp "${TMPDIR:-/tmp}/unrom-references.XXXXXX")"
observed_log="$(mktemp "${TMPDIR:-/tmp}/unrom-observed.XXXXXX")"
trap 'rm -f "$ingest_log" "$references_log" "$observed_log"' EXIT
set +e
npm run check:references --workspace server 2>&1 | tee "$references_log"
references_status=${PIPESTATUS[0]}
set -e
if [ "$references_status" -ne 0 ]; then
  log "reference check failed; keeping the previous overrides"
fi

log "checking a window of observed reference URLs"
set +e
npm run check:observed --workspace server 2>&1 | tee "$observed_log"
observed_status=${PIPESTATUS[0]}
set -e
if [ "$observed_status" -ne 0 ]; then
  log "observed reference check failed; a citation no longer resolves"
fi
# Keep the committed reports Prettier-clean for `npm run verify`.
for report in server/reference-overrides.json server/source-health.json; do
  if [ -f "$report" ]; then
    npx --no-install prettier --write "$report" >/dev/null
  fi
done

log "rebuilding the dataset"
npm run build:data

log "validating"
npm run verify

log "checking source health"
set +e
npm run check:sources
health_status=$?
set -e
if [ "$health_status" -ne 0 ]; then
  log "source health check failed; the snapshots that refreshed are still published"
fi

# A dead citation and a quiet source are both failures worth a non-zero exit, so
# the scheduler can tell a complete refresh from one that published bad claims.
refresh_status=$health_status
if [ "$observed_status" -ne 0 ]; then
  refresh_status=$observed_status
fi

if [ -z "$(git status --porcelain -- data/ server/reference-overrides.json server/source-health.json)" ]; then
  log "no snapshot changes; nothing to commit"
  exit "$refresh_status"
fi

if [ "$do_commit" = 0 ]; then
  log "changed files"
  git status --short -- data/ server/reference-overrides.json server/source-health.json
  log "refresh complete; nothing committed (--no-commit)"
  exit "$refresh_status"
fi

log "committing data changes"
git add -- data/ server/reference-overrides.json server/source-health.json
git commit -s -m "chore(data): refresh source snapshots" -- data/ server/reference-overrides.json server/source-health.json

if [ "$do_push" = 1 ]; then
  log "pushing"
  git push
  log "published; the images workflow will build and freshdock will deploy"
else
  log "commit created; push skipped (--no-push)"
fi

if [ "$health_status" -ne 0 ]; then
  log "published, but at least one source is stale or unreachable (see above)"
fi
if [ "$observed_status" -ne 0 ]; then
  log "published, but at least one observed citation no longer resolves (see above)"
fi
exit "$refresh_status"
