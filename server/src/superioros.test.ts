import assert from "node:assert/strict";
import { test } from "node:test";

import { parseSuperiorOS } from "./sources/superioros.ts";

test("SuperiorOS parses the aggregated per-device OTA snapshot", () => {
  const records = parseSuperiorOS(
    JSON.stringify({
      devices: [
        {
          file: "sweet.json",
          raw: { response: [{ device_name: "Xiaomi Redmi Note 10 Pro" }] },
        },
        {
          file: "nested/nope.json",
          raw: { response: [{ device_name: "Ignored" }] },
        },
        { file: "empty.json", raw: { response: [] } },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["sweet"],
  );
  assert.equal(records[0]?.name, "Xiaomi Redmi Note 10 Pro");
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/SuperiorOS-Devices/official_devices/blob/fourteen/sweet.json",
  );
});
