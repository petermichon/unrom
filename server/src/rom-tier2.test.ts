import assert from "node:assert/strict";
import { test } from "node:test";

import { parseBlackIron } from "./sources/blackiron.ts";
import { parseSparkOS } from "./sources/sparkos.ts";
import { parseYaap } from "./sources/yaap.ts";

test("YAAP reads the per-device files and drops retired statuses", () => {
  const records = parseYaap(
    JSON.stringify({
      files: [
        {
          path: "cancunf/cancunf.json",
          device: { name: "Motorola moto G54 5G", status: "Active" },
        },
        {
          path: "old/old.json",
          device: { name: "Retired Device", status: "Inactive" },
        },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["cancunf"],
  );
  assert.equal(records[0]?.name, "Motorola moto G54 5G");
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/yaap/device-info/blob/master/cancunf/cancunf.json",
  );
});

test("Black Iron parses raw build text, including malformed files", () => {
  const records = parseBlackIron(
    JSON.stringify({
      files: [
        { path: "builds/sweet.json", text: '{"status":"Active",' },
        { path: "builds/stone.json", text: '{"status":"Active"} {"status":' },
        { path: "builds/old.json", text: '{"status":"Inactive"}' },
        { path: "builds/bad.json", text: '{"error":true}' },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["sweet", "stone"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/Black-Iron-Project/OTA/blob/z16/builds/sweet.json",
  );
});

test("SparkOS reads the roster embedded in the download page", () => {
  const page = `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
    {
      props: {
        pageProps: {
          devices: [
            {
              codename: "davinci",
              vendor: "Xiaomi",
              model: "Redmi K20",
              active: true,
            },
            {
              codename: "retired",
              vendor: "Xiaomi",
              model: "Retired",
              active: false,
            },
          ],
        },
      },
    },
  )}</script></body></html>`;

  const records = parseSparkOS(page);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["davinci"],
  );
  assert.equal(records[0]?.name, "Redmi K20");
  assert.equal(records[0]?.brand, "Xiaomi");
  assert.equal(records[0]?.referenceUrl, "https://spark-os.tech/download");
});
