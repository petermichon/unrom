import { parseAllSources } from "../validate.ts";
import {
  classify,
  hostOf,
  mapByHost,
  probe,
  URL_CONCURRENCY_PER_HOST,
  type State,
} from "./probe.ts";
import { sampleWindow, windowsFor } from "./sample.ts";

// Observed reference gate. A URL the source published is evidence that the
// project names this device, but the page can disappear after the snapshot was
// taken and nothing would notice: the derived gate only probes one URL per host.
// This check re-probes a rotating window, so every citation is visited without
// hammering thousands of upstream pages in one run.
//
// `OBSERVED_SAMPLE` sets the window (default 100). Rotation is the UTC day
// number, so the window advances once a day and repeating a run the same day
// repeats the same window. `OBSERVED_ROTATION` overrides it for a backfill.
//
// Same rule as the derived gate: 404/410 is dead, everything else is unknown.
// Dead citations fail the run; unknown ones do not, because a bot wall is not
// evidence that a page is gone.

const DEFAULT_SAMPLE = 100;
const DAY_MS = 86_400_000;

const configured = process.env.OBSERVED_SAMPLE;
const size = configured === undefined ? DEFAULT_SAMPLE : Number(configured);
if (!Number.isInteger(size) || size < 0) {
  console.error(`OBSERVED_SAMPLE must be a whole number, got ${configured}`);
  process.exit(2);
}
if (size === 0) {
  console.log("✓ observed reference check disabled (OBSERVED_SAMPLE=0)");
  process.exit(0);
}

const rotationOverride = process.env.OBSERVED_ROTATION;
const rotation =
  rotationOverride === undefined
    ? Math.floor(Date.now() / DAY_MS)
    : Number(rotationOverride);
if (!Number.isInteger(rotation) || rotation < 0) {
  console.error(
    `OBSERVED_ROTATION must be a whole number, got ${rotationOverride}`,
  );
  process.exit(2);
}

const records = await parseAllSources();

// One entry per URL; the first record that names it carries the label. Record
// order is the registry's, so the label is stable across runs.
const observed = new Map<string, { romName: string; codename: string }>();
for (const record of records) {
  const url = record.referenceUrl;
  if (record.referenceKind !== "observed" || !url) continue;
  if (!observed.has(url)) {
    observed.set(url, { romName: record.romName, codename: record.codename });
  }
}

const urls = [...observed.keys()].sort();
if (urls.length === 0) {
  console.log("✓ no observed reference(s) to check");
  process.exit(0);
}

const windows = windowsFor(urls.length, size);
const sample = sampleWindow(urls, size, rotation);
const window = `${(((rotation % windows) + windows) % windows) + 1} of ${windows}`;

console.log(
  `Probing ${sample.length} of ${urls.length} observed reference(s) (window ${window}, rotates daily)…`,
);

const results = new Map<string, State>();
await mapByHost(sample, hostOf, URL_CONCURRENCY_PER_HOST, async (url) => {
  results.set(url, classify(await probe(url)));
});

const dead = [...results]
  .filter(([, state]) => state === "dead")
  .map(([url]) => url)
  .sort();
const unknown = [...results].filter(([, state]) => state === "unknown").length;

if (dead.length) {
  console.log(
    `✗ ${results.size - dead.length - unknown} ok, ${dead.length} dead, ${unknown} unknown`,
  );
  for (const url of dead) {
    const label = observed.get(url)!;
    console.log(`  ${url} (${label.romName} / ${label.codename})`);
  }
  console.log(
    "\nA dead citation is a false claim: fix the source or drop the reference.",
  );
  process.exit(1);
}

console.log(
  `✓ ${results.size - unknown} ok, ${unknown} unknown across ${results.size} observed reference(s)`,
);
