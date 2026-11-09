import { writeFile } from "node:fs/promises";

import { parseAllSources } from "../validate.ts";
import { REFERENCE_OVERRIDES_PATH } from "../paths.ts";

// Reference gate. Citations the pipeline *builds* from a codename (class B in
// ROM_DATA_SOURCES.md) are guesses until someone opens them. Probe those URLs
// and record the dead ones in `data/reference-overrides.json`; the build drops
// them, because an unverifiable citation is worse than none.
//
// Only `derived` URLs are probed per URL. A URL the source itself published is
// observed evidence: it existed when the snapshot was taken, and re-probing
// thousands of upstream pages on every refresh is neither polite nor cheap.
// One URL per host is still probed to catch a host that disappeared.
//
// 404/410 mean gone. Everything else (403 bot walls, 429, 5xx, timeouts) is
// unknown: it must not demote a citation.

const TIMEOUT_MS = 15_000;
const HOST_CONCURRENCY = 4;
const URL_CONCURRENCY_PER_HOST = 2;

interface Probe {
  status: number | null;
  error: string | null;
}

type State = "ok" | "dead" | "unknown";

async function probe(url: string): Promise<Probe> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "user-agent": "unrom-reference-check/1.0 (+https://unrom.com)",
      },
    });
    await response.body?.cancel();
    return { status: response.status, error: null };
  } catch (error) {
    return {
      status: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function classify(probe: Probe): State {
  if (probe.status === 404 || probe.status === 410) return "dead";
  if (probe.status !== null && probe.status >= 200 && probe.status < 400) {
    return "ok";
  }
  return "unknown";
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "(invalid)";
  }
}

/** Run `task` over `items`, at most `limit` at a time. */
async function pool<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const item = items[next++];
        await task(item);
      }
    },
  );
  await Promise.all(workers);
}

async function mapByHost<T>(
  items: T[],
  host: (item: T) => string,
  perHost: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = host(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  await pool([...groups.values()], HOST_CONCURRENCY, (group) =>
    pool(group, perHost, task),
  );
}

const records = await parseAllSources();

const derived = new Map<string, string>(); // url -> host
const allHosts = new Map<string, string>(); // host -> sample url
for (const record of records) {
  const url = record.referenceUrl;
  if (!url) continue;
  const host = hostOf(url);
  if (!allHosts.has(host)) allHosts.set(host, url);
  if (record.referenceKind === "derived") derived.set(url, host);
}

console.log(
  `Probing ${derived.size} derived reference(s) and ${allHosts.size} host(s)…`,
);

const results = new Map<string, State>();
await mapByHost(
  [...derived.keys()],
  (url) => derived.get(url)!,
  URL_CONCURRENCY_PER_HOST,
  async (url) => {
    results.set(url, classify(await probe(url)));
  },
);

const hostStates = new Map<string, State>();
await pool([...allHosts.keys()], HOST_CONCURRENCY, async (host) => {
  hostStates.set(host, classify(await probe(allHosts.get(host)!)));
});

const dead = [...results]
  .filter(([, state]) => state === "dead")
  .map(([url]) => url)
  .sort();
const unverified = [...results]
  .filter(([, state]) => state === "unknown")
  .map(([url]) => url)
  .sort();

const deadHosts = [...hostStates]
  .filter(([, state]) => state === "dead")
  .map(([host]) => host)
  .sort();

await writeFile(
  REFERENCE_OVERRIDES_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      dead,
      unverified,
      deadHosts,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

console.log(
  `✓ ${derived.size - dead.length - unverified.length} ok, ${dead.length} dead, ${unverified.length} unverified → ${REFERENCE_OVERRIDES_PATH}`,
);
if (deadHosts.length) {
  console.log(`✗ dead host(s): ${deadHosts.join(", ")}`);
}
