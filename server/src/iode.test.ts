import assert from "node:assert/strict";
import { test } from "node:test";

import { parseIodeHtml } from "./sources/iode.ts";

test("iodéOS parses the official supported-devices table", () => {
  const records = parseIodeHtml(`
<tr class="row-2">
	<td class="column-1">Google</td><td class="column-2"><a href="https://shop.iode.tech/x">Pixel 9 (tokay)</a></td><td class="column-3"></td>
</tr>
<tr class="row-3">
	<td class="column-1">Braxtech</td><td class="column-2">Brax3 (BraX3)</td><td class="column-3"></td>
</tr>
<tr class="row-4">
	<td class="column-1">Motorola</td><td class="column-2">moto g42 (Hawao)</td><td class="column-3"></td>
</tr>
<tr class="row-5">
	<td class="column-1">GSI (multiple)</td><td class="column-2">GSI (multiple)</td><td class="column-3"></td>
</tr>
`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["tokay", "brax3", "hawao"],
  );
  assert.deepEqual(
    records.map((record) => record.name),
    ["Pixel 9", "Brax3", "moto g42"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["Google", "Braxtech", "Motorola"],
  );
  assert.ok(
    records.every(
      (record) =>
        record.referenceUrl ===
        "https://iode.tech/iodeos-official-supported-devices",
    ),
  );
});
