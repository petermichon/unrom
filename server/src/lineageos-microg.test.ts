import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLineageOSMicroG } from "./sources/lineageos-microg.ts";

test("LineageOS for microG parses the build host index", () => {
  const records = parseLineageOSMicroG(`
<tr class="file">
  <td><a href="./tokay/"><span class="name">tokay/</span></a></td>
  <td>&mdash;</td>
  <td class="timestamp hideable"><time datetime="2026-11-19T14:21:58Z">11/19/2026</time></td>
</tr>
<tr class="file">
  <td><a href="./FP5/"><span class="name">FP5/</span></a></td>
  <td>&mdash;</td>
  <td class="timestamp hideable"><time datetime="2026-11-23T08:03:11Z">11/23/2026</time></td>
</tr>
<tr class="file">
  <td><a href="./builds/"><span class="name">builds/</span></a></td>
  <td>&mdash;</td>
  <td class="timestamp hideable"><time datetime="2026-11-27T00:00:00Z">11/27/2026</time></td>
</tr>
<tr class="file">
  <td><a href="./IodeOS/"><span class="name">IodeOS/</span></a></td>
  <td>&mdash;</td>
  <td class="timestamp hideable"><time datetime="2026-11-27T00:00:00Z">11/27/2026</time></td>
</tr>
<tr class="file">
  <td><a href="./LineageOS/"><span class="name">LineageOS/</span></a></td>
  <td>&mdash;</td>
  <td class="timestamp hideable"><time datetime="2026-11-27T00:00:00Z">11/27/2026</time></td>
</tr>
<tr class="file">
  <td><a href="./tokay/"><span class="name">tokay/</span></a></td>
  <td>&mdash;</td>
  <td class="timestamp hideable"><time datetime="2026-11-19T14:21:58Z">11/19/2026</time></td>
</tr>
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
  // The row's timestamp is the newest build for the device.
  assert.deepEqual(
    records.map((record) => record.buildDate),
    ["2026-11-19", "2026-11-23"],
  );
});

test("a row without a usable timestamp keeps the claim, undated", () => {
  const records = parseLineageOSMicroG(`
<tr class="file">
  <td><a href="./sunfish/"><span class="name">sunfish/</span></a></td>
</tr>
`);

  assert.equal(records.length, 1);
  assert.equal(records[0]?.buildDate, null);
});
