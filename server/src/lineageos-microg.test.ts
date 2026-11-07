import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLineageOSMicroG } from "./sources/lineageos-microg.ts";

test("LineageOS for microG parses the build host index", () => {
  const records = parseLineageOSMicroG(`
<a href="//">Parent directory</a>
<a href="./tokay/">tokay/</a>
<a href="./FP5/">FP5/</a>
<a href="./builds/">builds/</a>
<a href="./IodeOS/">IodeOS/</a>
<a href="./LineageOS/">LineageOS/</a>
<a href="./tokay/">tokay/</a>
`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["tokay", "FP5"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://download.lineage.microg.org/tokay/",
  );
  assert.equal(
    records[1]?.referenceUrl,
    "https://download.lineage.microg.org/FP5/",
  );
});
