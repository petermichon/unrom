import assert from "node:assert/strict";
import { test } from "node:test";

import { sources } from "./sources/registry.ts";

function parserFor(file: string) {
  const source = sources.find((candidate) => candidate.file === file);
  assert.ok(source, `no source registered for ${file}`);
  return source.parse;
}

test("2by2 keeps the branch rosters apart but names the brand", () => {
  const parse = parserFor("2by2.json");
  const records = parse(
    JSON.stringify({
      devices: [
        {
          codename: "M06",
          manufacturer: "FCNT",
          name: "arrows We2 Plus",
        },
      ],
    }),
  );

  assert.equal(records.length, 1);
  assert.equal(records[0]?.romId, "2by2-project");
  assert.equal(records[0]?.codename, "M06");
  assert.equal(records[0]?.brand, "FCNT");
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/2by2-Project/android_vendor_2by2-ota/blob/main/devices.json",
  );
});

test("Project Sakura drops retired entries", () => {
  const parse = parserFor("sakura.json");
  const records = parse(
    JSON.stringify([
      { codename: "zorn", name: "Poco F7 Pro", brand: "Poco", active: true },
      { codename: "old", name: "Retired", brand: "Poco", active: false },
    ]),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["zorn"],
  );
});

test("GenesisOS skips devices marked unmaintained", () => {
  const parse = parserFor("genesisos.json");
  const records = parse(
    JSON.stringify({
      devices: [
        { name: "Poco F5", codename: "marble" },
        { name: "Poco F4", codename: "munch", isMaintained: false },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["marble"],
  );
  assert.equal(records[0]?.name, "Poco F5");
});

test("WitAqua reads the devices wrapper and brand", () => {
  const parse = parserFor("witaqua.json");
  const records = parse(
    JSON.stringify({
      devices: [{ name: "Pixel 6a", codename: "bluejay", brand: "Google" }],
    }),
  );

  assert.equal(records[0]?.codename, "bluejay");
  assert.equal(records[0]?.brand, "Google");
});

test("EtherealOS reads the A14 device array", () => {
  const parse = parserFor("etherealos.json");
  const records = parse(
    JSON.stringify([
      { codename: "onclite", brand: "Xiaomi", name: "Redmi 7" },
      { codename: "RMX2020", brand: "Realme", name: "C3" },
    ]),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["onclite", "RMX2020"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/Ethereal-OS/Ethereal-Devices/blob/A14/devices.json",
  );
});
