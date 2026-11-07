import assert from "node:assert/strict";
import { test } from "node:test";

import { parseEosHtml } from "./sources/eos.ts";

test("/e/OS parses the official devices table", () => {
  const records = parseEosHtml(`
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Xiaomi</td>
  <td class=has-tooltip data-label=Name><a href=monet/>Mi 10 Lite 5G</a><div class=name-meta><span class=chip>monet</span></div></td>
</tr>
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Google</td>
  <td data-label=Name><a href=oriole/>Pixel 6</a><span class=chip>oriole</span></td>
</tr>
<tr data-device-type=phone>
  <td class=brand data-label=Brand>Google</td>
  <td data-label=Name><a href=oriole/>Pixel 6 duplicate</a><span class=chip>oriole</span></td>
</tr>
`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["monet", "oriole"],
  );
  assert.deepEqual(
    records.map((record) => record.name),
    ["Mi 10 Lite 5G", "Pixel 6"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["Xiaomi", "Google"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://doc.e.foundation/devices/monet",
  );
});
