import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLineageOS } from "./sources/lineageos.ts";

// Two documents with the same codename and a `variant` number: one build
// target, two marketed models.
const otter = JSON.stringify([
  "codename: otter\nname: 'SHIFTphone 8.0'\nvendor: SHIFT\nvariant: 1\n",
  "codename: otter\nname: 'SHIFTphone 8.1'\nvendor: SHIFT\nvariant: 2\n",
  "codename: tokay\nname: Pixel 9\nvendor: Google\n",
]);

test("LineageOS merges variant documents into one device", () => {
  const records = parseLineageOS(otter);
  const otters = records.filter((record) => record.codename === "otter");

  assert.equal(otters.length, 1);
  assert.equal(otters[0]?.name, "SHIFTphone 8.0");
  assert.deepEqual(otters[0]?.names, ["SHIFTphone 8.0", "SHIFTphone 8.1"]);
  assert.equal(otters[0]?.brand, "SHIFT");
  assert.equal(
    otters[0]?.referenceUrl,
    "https://wiki.lineageos.org/devices/otter/",
  );
  assert.equal(otters[0]?.referenceKind, "derived");
});

test("LineageOS keeps separate codenames separate", () => {
  const records = parseLineageOS(otter);
  assert.deepEqual(
    records.map((record) => record.codename),
    ["otter", "tokay"],
  );
  assert.deepEqual(records[1]?.names, ["Pixel 9"]);
});
