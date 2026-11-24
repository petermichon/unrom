import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGrapheneOS, parseReleaseNotes } from "./sources/grapheneos.ts";

const FAQ = `
<p>GrapheneOS has official production support for the following devices:</p>
<ul>
<li>Pixel 10a (stallion)</li>
<li>Pixel 9 Pro Fold (comet)</li>
<li>Pixel 6a (bluejay)</li>
</ul>
<p>Legacy devices:</p>
<ul><li>Pixel 4 (flame)</li></ul>
`;

const snapshot = (builds: unknown = []) =>
  JSON.stringify({ page: FAQ, builds });

test("GrapheneOS parses only the current official device list", () => {
  const records = parseGrapheneOS(snapshot());

  assert.deepEqual(
    records.map((record) => record.codename),
    ["stallion", "comet", "bluejay"],
  );
  assert.deepEqual(
    records.map((record) => record.name),
    ["Pixel 10a", "Pixel 9 Pro Fold", "Pixel 6a"],
  );
  assert.ok(records.every((record) => record.brand === "Google"));
  assert.ok(
    records.every(
      (record) =>
        record.referenceUrl === "https://grapheneos.org/faq#supported-devices",
    ),
  );
});

test("GrapheneOS attaches each device's newest release date", () => {
  const records = parseGrapheneOS(
    snapshot([
      { codename: "bluejay", version: "2026111800", date: "2026-11-13" },
      // A device without a release file says nothing, rather than guessing.
      { codename: "unknown", version: "2026111800", date: "2026-11-13" },
    ]),
  );

  const line = (codename: string) =>
    records.find((record) => record.codename === codename);
  assert.equal(line("bluejay")?.buildDate, "2026-11-13");
  // No release notes in this snapshot, so the patch level stays unknown.
  assert.equal(line("bluejay")?.securityPatch, null);
  assert.equal(line("comet")?.buildDate, null);
});

const RELEASES = `
<article id=2026111800><h3><a href=#2026111800>2026111800</a></h3><p>Pixel 6 and Pixel 6 Pro no longer receive updates from Google. Those are now in legacy extended support for GrapheneOS. The patch level has been frozen at 2026-11-01 for those 2 devices due to the end of firmware and driver updates.</p><p>Tags:</p><ul><li><a href=https://example.test>2026111800</a> (Pixel 6, Pixel 6 Pro, Pixel 6a, Pixel 10a, Pixel 9 Pro Fold)</li></ul><p>Changes since the 2026111300 release:</p><ul><li>full 2026-11-05 Pixel security patch level</li></ul></article>
<article id=2026111300><h3><a href=#2026111300>2026111300</a></h3><p>Changes since the 2026110200 release:</p><ul><li>full 2026-10-05 Pixel security patch level</li></ul></article>
`;

test("GrapheneOS release notes carry a patch level and its freezes", () => {
  const notes = parseReleaseNotes(RELEASES);

  assert.equal(notes.get("2026111800")?.patchLevel, "2026-11-05");
  assert.deepEqual(notes.get("2026111800")?.frozen, [
    { names: ["Pixel 6", "Pixel 6 Pro"], date: "2026-11-01" },
  ]);
  assert.equal(notes.get("2026111300")?.patchLevel, "2026-10-05");
  assert.deepEqual(notes.get("2026111300")?.frozen, []);
});

test("GrapheneOS pairs each device's version with its release note", () => {
  const records = parseGrapheneOS(
    JSON.stringify({
      page: `
<p>GrapheneOS has official production support for the following devices:</p>
<ul>
<li>Pixel 10a (stallion)</li>
<li>Pixel 9 Pro Fold (comet)</li>
<li>Pixel 6a (bluejay)</li>
<li>Pixel 6 (raven)</li>
</ul>`,
      releases: RELEASES,
      builds: [
        { codename: "bluejay", version: "2026111800", date: "2026-11-18" },
        { codename: "raven", version: "2026111800", date: "2026-11-18" },
        { codename: "comet", version: "2026111300", date: "2026-11-13" },
        { codename: "stallion", version: "2026999999", date: "2026-11-18" },
      ],
    }),
  );

  const line = (codename: string) =>
    records.find((record) => record.codename === codename);
  assert.equal(line("bluejay")?.securityPatch, "2026-11-05");
  // The freeze outranks the release-wide level.
  assert.equal(line("raven")?.securityPatch, "2026-11-01");
  assert.equal(line("comet")?.securityPatch, "2026-10-05");
  // A version with no note stays unknown instead of borrowing the newest one.
  assert.equal(line("stallion")?.securityPatch, null);
  assert.equal(line("stallion")?.buildDate, "2026-11-18");
});
