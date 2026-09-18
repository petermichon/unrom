import Database from "better-sqlite3";

import { DB_PATH } from "../paths.ts";

// Reference health check. Every `rom_devices.source_url` is a citation for the
// claim "this ROM supports this device"; a citation that no longer resolves is
// worse than none, because it implies verifiability. This script reads the
// built database and reports which reference hosts are dead — it never mutates
// data. Reclassify the affected sources (see ROM_DATA_SOURCES.md) by hand.
//
// Probing is per-host, not per-URL: the dataset has ~1500 device pages across
// ~17 hosts, and the failure mode we care about is a whole host going away
// (e.g. corvusrom.com). Fetching every device page would be thousands of
// requests for the same signal.

const TIMEOUT_MS = 15_000;
const CONCURRENCY = 6;

interface Reference {
  url: string;
  romId: string;
}

interface HostReport {
  host: string;
  records: number;
  urls: number;
  sample: string;
  status: number | null;
  error: string | null;
  probeUrl: string;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "(invalid)";
  }
}

function collectReferences(dbPath: string): Reference[] {
  const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });
  const rows = sqlite
    .prepare(
      "select rom_id, source_url from rom_devices where source_url is not null",
    )
    .all() as Array<{ rom_id: string; source_url: string }>;
  sqlite.close();
  return rows.map((row) => ({ romId: row.rom_id, url: row.source_url }));
}

async function probe(
  url: string,
): Promise<{ status: number | null; error: string | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Some hosts block HEAD and non-browser agents. A ranged GET with a
    // browser-like Accept header is the closest we can get to a real visit
    // without downloading whole pages. A fetch-level failure (DNS, reset) is
    // reported separately from an HTTP status so blocked-but-live hosts like
    // t.me and XDA are not mistaken for dead links.
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        range: "bytes=0-0",
      },
    });
    // Drain a byte so the connection closes cleanly.
    await response.arrayBuffer();
    return { status: response.status, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: null, error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

const references = collectReferences(DB_PATH);
if (references.length === 0) {
  console.error(`No references found in ${DB_PATH} — build the data first.`);
  process.exit(1);
}

const byHost = new Map<
  string,
  { records: number; urls: Set<string>; sample: string }
>();
for (const { url } of references) {
  const host = hostOf(url);
  const entry = byHost.get(host) ?? { records: 0, urls: new Set(), sample: url };
  entry.records++;
  entry.urls.add(url);
  byHost.set(host, entry);
}

const hosts = [...byHost.entries()].map(([host, entry]) => ({
  host,
  records: entry.records,
  urls: entry.urls.size,
  sample: entry.sample,
  probeUrl: entry.sample,
}));

const probes = await mapLimit(hosts, CONCURRENCY, (entry) =>
  probe(entry.probeUrl),
);

const reports: HostReport[] = hosts.map((host, index) => ({
  ...host,
  status: probes[index].status,
  error: probes[index].error,
}));

type Health = "live" | "blocked" | "timeout" | "dead";

function health(report: HostReport): Health {
  if (report.error !== null || report.status === null) {
    const error = report.error ?? "unknown";
    // A timeout is inconclusive: the host may be slow, geo-blocked, or
    // rate-limiting. Only a name-resolution or connection failure means the
    // host is actually gone.
    if (/timed? ?out|abort/i.test(error)) return "timeout";
    return "dead";
  }
  if ([401, 403, 429].includes(report.status)) return "blocked";
  if (report.status >= 400) return "dead";
  return "live";
}

const classified = reports.map((report) => ({ report, health: health(report) }));
const pick = (kind: Health) =>
  classified
    .filter((entry) => entry.health === kind)
    .map((entry) => entry.report)
    .sort((a, b) => b.records - a.records);

const dead = pick("dead");
const blocked = pick("blocked");
const timeouts = pick("timeout");
const deadRecords = dead.reduce((sum, report) => sum + report.records, 0);
const liveCount =
  reports.length - dead.length - blocked.length - timeouts.length;

console.log(`Checked ${reports.length} reference host(s)`);
console.log(
  `${liveCount} live, ${blocked.length} blocked, ${timeouts.length} timed out, ` +
    `${dead.length} dead (${deadRecords}/${references.length} records affected)\n`,
);

if (dead.length === 0) {
  console.log("No dead reference hosts.");
  if (timeouts.length > 0) {
    console.log(
      "Timed-out hosts are inconclusive — re-run or check them by hand.",
    );
  }
  process.exit(0);
}

for (const report of dead) {
  const reason = report.error ?? `HTTP ${report.status}`;
  console.log(
    `${report.host} — ${report.records} record(s), ${report.urls} URL(s)`,
  );
  console.log(`  ${reason}: ${report.sample}`);
}

if (blocked.length > 0) {
  console.log("\nBlocked (alive, but refuses automated requests):");
  for (const report of blocked) {
    console.log(
      `  ${report.host} — HTTP ${report.status}, ${report.records} record(s)`,
    );
  }
}

if (timeouts.length > 0) {
  console.log("\nTimed out (inconclusive):");
  for (const report of timeouts) {
    console.log(`  ${report.host} — ${report.records} record(s)`);
  }
}

console.log(
  "\nDead hosts mean the cited source is gone; move the affected ROMs to the\nexception list in ROM_DATA_SOURCES.md or find a replacement reference.",
);

process.exit(1);
