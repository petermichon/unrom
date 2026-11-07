import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGrapheneOS } from "./sources/grapheneos.ts";

test("GrapheneOS parses only the current official device list", () => {
  const records = parseGrapheneOS(`
<p>GrapheneOS has official production support for the following devices:</p>
<ul>
<li>Pixel 10a (stallion)</li>
<li>Pixel 9 Pro Fold (comet)</li>
<li>Pixel 6a (bluejay)</li>
</ul>
<p>Legacy devices:</p>
<ul><li>Pixel 4 (flame)</li></ul>
`);

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
