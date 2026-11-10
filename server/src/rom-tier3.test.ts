import assert from "node:assert/strict";
import { test } from "node:test";

import { parseProjectBlaze } from "./sources/project-blaze.ts";
import { parseTequilaOS } from "./sources/tequila.ts";

test("Project Blaze flattens brand groups and splits combined codenames", () => {
  const records = parseProjectBlaze(
    JSON.stringify([
      {
        brand: "Xiaomi",
        devices: {
          "0": { name: "Redmi 7", codename: "onclite, onc" },
          "1": { name: "POCO F5", codename: "marble" },
        },
      },
      {
        brand: "Nothing",
        devices: {
          "0": { name: "POCO F5", codename: "marble" },
          "1": { name: "Pixel 6 Pro", codename: "raven & oriole" },
        },
      },
    ]),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["onclite", "onc", "marble", "raven", "oriole"],
  );
  // The Nothing group mislabels the Xiaomi device; the first entry wins.
  assert.equal(records[2]?.brand, "Xiaomi");
  assert.equal(records[0]?.reportedCodename, "onclite");
  assert.equal(records[4]?.reportedCodename, "raven");
});

test("Tequila OS keeps only devices not marked discontinued", () => {
  const records = parseTequilaOS(
    JSON.stringify({
      Google: {
        barbet: { name: "Pixel 5a", discontinued: true },
        bluejay: { name: "Pixel 6a" },
      },
      Xiaomi: {
        miatoll: { name: "Redmi Note 9S", discontinued: false },
      },
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["bluejay", "miatoll"],
  );
  assert.equal(records[0]?.brand, "Google");
  assert.equal(records[1]?.name, "Redmi Note 9S");
});
