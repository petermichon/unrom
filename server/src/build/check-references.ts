import { writeFile } from "node:fs/promises";

import { parseAllSources } from "../validate.ts";
import { REFERENCE_OVERRIDES_PATH } from "../paths.ts";
import {
  classify,
  HOST_CONCURRENCY,
  hostOf,
  mapByHost,
  pool,
  probe,
  URL_CONCURRENCY_PER_HOST,
  type State,
} from "./probe.ts";

// Reference gate. Citations the pipeline *builds* from a codename (class B in
// DATASET.md) are guesses until someone opens them. Probe those URLs
// and record the dead ones in `server/reference-overrides.json`; the build
// drops them, because an unverifiable citation is worse than none.
//
// Only `derived` URLs are probed per URL here. A URL the source itself
// published is observed evidence: it existed when the snapshot was taken, and
// re-probing thousands of upstream pages on every refresh is neither polite
// nor cheap. One URL per host is still probed to catch a host that disappeared.
// `check-observed` re-probes a rotating window of those URLs on a schedule.

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
