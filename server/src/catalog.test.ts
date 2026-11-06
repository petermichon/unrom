import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePlayDevices } from "./sources/play-devices.ts";

test("Play device CSV parses quoted fields and drops incomplete rows", () => {
  const csv = [
    "\uFEFFRetail Branding,Marketing Name,Device,Model",
    '"Google","Pixel 9","tokay","GZC4K"',
    '"Acme, Inc.","Acme Phone, Pro","acmepro","A1"',
    '"","No Brand","x","X"',
    '"Brand","","empty","E"',
    '"Brand","No Codename","","N"',
    "",
  ].join("\r\n");

  assert.deepEqual(parsePlayDevices(csv), [
    { brand: "Google", name: "Pixel 9", codename: "tokay", model: "GZC4K" },
    {
      brand: "Acme, Inc.",
      name: "Acme Phone, Pro",
      codename: "acmepro",
      model: "A1",
    },
  ]);
});
