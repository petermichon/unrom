import { SOURCE_HEALTH_PATH } from "../paths.ts";
import {
  auditHealth,
  readSourceHealth,
  type HealthFinding,
} from "../ingest/health.ts";
import { sources } from "../ingest/sources.ts";

// Fetch-health gate. The snapshots say what a source last said, not when the
// pipeline last heard from it, so a host that has been down for a week looks
// exactly like a project that stopped shipping builds. `data/` is written by
// `ingest`, which records per-source success and failure in
// `server/source-health.json`; this check reads that record and fails on a
// source that has gone quiet.
//
// It does not fetch anything: a stale record is a fact about the last refresh,
// and the scheduled wrapper runs this after the ingest that produced it.

const DEFAULT_MAX_AGE_DAYS = 7;

const configured = process.env.SOURCE_MAX_AGE_DAYS;
const maxAgeDays =
  configured === undefined ? DEFAULT_MAX_AGE_DAYS : Number(configured);
if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0) {
  console.error(`SOURCE_MAX_AGE_DAYS must be a number, got ${configured}`);
  process.exit(2);
}

function history(finding: HealthFinding): string {
  if (!finding.lastSuccessAt) return "no successful fetch recorded";
  const days = finding.ageDays === 1 ? "1 day" : `${finding.ageDays} days`;
  return `last success ${days} ago (${finding.lastSuccessAt})`;
}

function reason(finding: HealthFinding): string {
  if (finding.state === "failed") {
    return `last attempt failed: ${finding.lastError}; ${history(finding)}`;
  }
  if (finding.state === "never") return "no successful fetch recorded";
  return `last success is older than the allowed age; ${history(finding)}`;
}

const entries = await readSourceHealth();
const { findings, orphans } = auditHealth(
  entries,
  sources,
  new Date(),
  maxAgeDays,
);

const problems = findings.filter((finding) => finding.state !== "ok");
const healthy = findings.length - problems.length;

for (const finding of problems) {
  console.log(`✗ ${finding.id} (${finding.file}): ${reason(finding)}`);
}

if (orphans.length) {
  console.log(`✗ recorded source(s) no longer fetched: ${orphans.join(", ")}`);
}

if (problems.length || orphans.length) {
  console.log(
    `\n${healthy} of ${findings.length} source(s) fetched within ${maxAgeDays} day(s); ${problems.length + orphans.length} problem(s) → ${SOURCE_HEALTH_PATH}`,
  );
  process.exit(1);
}

console.log(
  `✓ ${healthy} of ${findings.length} source(s) fetched within ${maxAgeDays} day(s) → ${SOURCE_HEALTH_PATH}`,
);
