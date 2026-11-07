import assert from "node:assert/strict";
import { test } from "node:test";

import { parseAlphaDroid, parseAlphaDroidJson } from "./sources/alphadroid.ts";

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

test("AlphaDroid parses the website build index", () => {
  const records = parseAlphaDroidJson(
    JSON.stringify({
      devices: [
        {
          name: "astonc.json",
          data: {
            response: [{ oem: "OnePlus", device: "astonc", version: "4.7" }],
          },
        },
        {
          name: "akita.json",
          data: {
            response: [
              { oem: "Google", device: "Pixel 8a (akita)", version: "4.5" },
            ],
          },
        },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["astonc", "akita"],
  );
  assert.deepEqual(
    records.map((record) => record.name),
    [null, "Pixel 8a (akita)"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["OnePlus", "Google"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://alphadroid.org/#devices?codename=astonc",
  );
});
