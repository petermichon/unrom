import assert from "node:assert/strict";
import { test } from "node:test";

import { sources } from "./sources/registry.ts";

function parse(id: string, raw: unknown) {
  const source = sources.find((entry) => entry.id === id);
  assert.ok(source, `${id} is registered`);
  return source.parse(JSON.stringify(raw));
}

// The 2021-and-older rosters are declarative config entries: these tests pin
// the field mapping each source relies on, so an upstream rename fails here.

test("AOSiP reads the model name from `device` and cites the roster", () => {
  const [record] = parse("aosip", [
    {
      codename: "alioth",
      device: "POCO F3 / Redmi K40",
      maintainer: "someone",
    },
  ]);

  assert.equal(record?.codename, "alioth");
  assert.equal(record?.name, "POCO F3 / Redmi K40");
  assert.equal(record?.romId, "aosip");
  assert.equal(
    record?.referenceUrl,
    "https://github.com/AOSiP/api/blob/master/devices.json",
  );
});

test("SlimRoms reads the codename from `devicename` and corrects the tablet name", () => {
  const records = parse("slimroms", [
    {
      manufacturer: "HTC",
      devicename: "flounder",
      description: "Nexus 9",
    },
  ]);

  assert.equal(records[0]?.codename, "flounder");
  assert.equal(records[0]?.brand, "HTC");
  // The roster omits the variant suffix; the registry needs it to tell the
  // Wi-Fi tablet from the LTE one.
  assert.equal(records[0]?.name, "Nexus 9 (Wi-Fi)");
});

test("Freaky OS selects the `response` array", () => {
  const records = parse("freaky-os", {
    response: [{ name: "Samsung A7", brand: "Samsung", codename: "a7xelte" }],
  });

  assert.deepEqual(
    records.map((record) => [record.codename, record.name, record.brand]),
    [["a7xelte", "Samsung A7", "Samsung"]],
  );
});

test("AIM ROM reads the codename from `devicename` and keeps no model name", () => {
  const [record] = parse("aim-rom", [
    { devicename: "Beryllium", manufacturer: "Xiaomi" },
  ]);

  assert.equal(record?.codename, "Beryllium");
  assert.equal(record?.brand, "Xiaomi");
  // The roster repeats the codename instead of a model name.
  assert.equal(record?.name, null);
});

test("ZeusOS reads the marketing name from `device`", () => {
  const [record] = parse("zeusos", [
    { device: "K20 pro", codename: "Raphael", url: "https://example.com" },
  ]);

  assert.equal(record?.codename, "Raphael");
  assert.equal(record?.name, "K20 pro");
});
