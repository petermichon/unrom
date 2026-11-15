import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGrapheneOS } from "./sources/grapheneos.ts";

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
      { codename: "bluejay", date: "2026-11-13" },
      // A device without a release file says nothing, rather than guessing.
      { codename: "unknown", date: "2026-11-13" },
    ]),
  );

  const line = (codename: string) =>
    records.find((record) => record.codename === codename);
  assert.equal(line("bluejay")?.buildDate, "2026-11-13");
  // Releases carry no patch level.
  assert.equal(line("bluejay")?.securityPatch, null);
  assert.equal(line("comet")?.buildDate, null);
});
