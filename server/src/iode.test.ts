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

test("iodéOS reads the bootloader column as a per-device statement", () => {
  const row = (brand: string, model: string, locked: string) => `
<tr class="row-2">
  <td class="column-1">${brand}</td>
  <td class="column-2">${model}</td>
  <td class="column-3"></td>
  <td class="column-4">7</td>
  <td class="column-5">yes</td>
  <td class="column-6">${locked}</td>
  <td class="column-7">yes</td>
  <td class="column-8">yes</td>
  <td class="column-9">yes</td>
</tr>`;

  const records = parseIodeHtml(
    row("Google", "Pixel 9 (tokay)", "yes") +
      row("Xiaomi", "Mi 10 Lite (monet)", "no"),
  );

  assert.equal(records[0]?.relock?.status, "supported");
  assert.match(records[0]?.relock?.summary ?? "", /Bootloader locked\? yes/);
  assert.equal(
    records[0]?.relock?.sourceUrl,
    "https://iode.tech/iodeos-official-supported-devices",
  );
  assert.equal(records[1]?.relock?.status, "unsupported");
  assert.match(records[1]?.relock?.summary ?? "", /Bootloader locked\? no/);
});
