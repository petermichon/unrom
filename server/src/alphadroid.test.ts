import assert from "node:assert/strict";
import { test } from "node:test";

import { parseAlphaDroid } from "./sources/alphadroid.ts";

test("AlphaDroid parses grouped codenames and corrects upstream typos", () => {
  const records = parseAlphaDroid(`
# Device List

## Google
- **Pixel 6a (oriole)**

## OnePlus
- **OnePlus 8 Series (instanoodle, instanoodlep, kebab)**

## Xiaomi
- **Poco F6 (poridot)**
- **Redmi Note 8/8T (ginkgo/willow)**
`);

  assert.deepEqual(records.map((record) => record.codename).sort(), [
    "bluejay",
    "ginkgo",
    "instantnoodle",
    "instantnoodlep",
    "kebab",
    "peridot",
    "willow",
  ]);
  assert.equal(
    records.find((record) => record.codename === "bluejay")?.name,
    "Pixel 6a",
  );
  assert.equal(
    records.find((record) => record.codename === "kebab")?.reportedCodename,
    "instantnoodle",
  );
  assert.equal(
    records.find((record) => record.codename === "instantnoodle")
      ?.reportedCodename,
    null,
  );
  assert.equal(
    records.find((record) => record.codename === "peridot")?.brand,
    "Xiaomi",
  );
});
