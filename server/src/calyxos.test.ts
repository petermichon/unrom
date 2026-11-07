import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCalyxOS } from "./sources/calyxos.ts";

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
