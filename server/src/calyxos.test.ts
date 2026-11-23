import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCalyxOS } from "./sources/calyxos.ts";

test("CalyxOS reads the release date from the install table", () => {
  const records = parseCalyxOS(`
<table>
  <tr><th>Device</th><th>Codename</th><th>Version</th><th>Release date</th></tr>
  <tr><td><a href="./devices/tokay">Pixel 9</a></td><td>tokay</td><td>8.0.5.21</td><td>2026-11-07</td></tr>
  <tr><td><a href="./devices/FP5">Fairphone 5</a></td><td>FP5</td><td>8.0.5.21</td><td>2026-11-07</td></tr>
</table>
`);

  assert.deepEqual(
    records.map((record) => [record.codename, record.buildDate]),
    [
      ["tokay", "2026-11-07"],
      ["FP5", "2026-11-07"],
    ],
  );
});

test("CalyxOS parses install links and assigns vendors", () => {
  const records = parseCalyxOS(`
<a href="./devices/tokay">Pixel 9</a>
<a href="./devices/FP5">Fairphone 5</a>
<a href="./devices/fogo">moto g 5G - 2024</a>
<a href="./devices/otter">SHIFTphone 8</a>
<a href="./devices/tokay">Pixel 9 duplicate</a>
`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["tokay", "FP5", "fogo", "otter"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["Google", "Fairphone", "Motorola", "SHIFT"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://calyxos.org/install/devices/tokay/",
  );
});
