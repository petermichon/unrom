import assert from "node:assert/strict";
import { test } from "node:test";

import { parseAxionOs } from "./sources/axionos.ts";

test("AxionOS parses active devices from the download manifest", () => {
  const records = parseAxionOs(
    JSON.stringify({
      schema: 2,
      devices: [
        {
          codename: "oriole",
          name: "Google Pixel 6",
          brand: "google",
          status: "active",
        },
        {
          codename: "beryllium",
          name: "POCO F1",
          brand: "xiaomi",
          status: "inactive",
        },
        {
          codename: "Tetris",
          name: "POCO F7",
          brand: "xiaomi",
          status: "active",
        },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["oriole", "Tetris"],
  );
  assert.deepEqual(
    records.map((record) => record.name),
    ["Google Pixel 6", "POCO F7"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://www.axionos.org/download/oriole",
  );
});
