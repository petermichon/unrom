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

import {
  classifyFormFactor,
  isPlausibleName,
  selectCatalog,
} from "./sources/catalog.ts";

test("form factor classification", () => {
  assert.equal(classifyFormFactor("Samsung", ["Galaxy S24"]), "phone");
  assert.equal(classifyFormFactor("Samsung", ["Galaxy Tab S9"]), "tablet");
  assert.equal(classifyFormFactor("Samsung", ["Galaxy Watch6"]), "watch");
  assert.equal(
    classifyFormFactor("Google", ["Chromecast with Google TV"]),
    "tv",
  );
  assert.equal(classifyFormFactor("AYN", ["Odin 2"]), "handheld");
  assert.equal(classifyFormFactor("Banana Pi", ["M5"]), "devkit");
  assert.equal(classifyFormFactor("Google", ["Android Automotive"]), "auto");
  assert.equal(classifyFormFactor("Google", ["Jamboard"]), "other");
});

test("name quality gate", () => {
  assert.equal(isPlausibleName("Pixel 9", "tokay"), true);
  assert.equal(isPlausibleName("D", "tokay"), false);
  assert.equal(isPlausibleName("tokay", "tokay"), false);
  assert.equal(isPlausibleName("10or_G2", "g2"), false);
  assert.equal(isPlausibleName("1234", "x"), false);
});

test("catalogue selection applies brand, name and form-factor gates", () => {
  const selection = selectCatalog([
    { brand: "Google", name: "Pixel 9", codename: "tokay", model: "GZC4K" },
    { brand: "Google", name: "Pixel 9 Pro", codename: "tokay", model: "GZC4K" },
    { brand: "Samsung", name: "Galaxy Watch6", codename: "watch6", model: "" },
    { brand: "Samsung", name: "Galaxy S24", codename: "eureka", model: "" },
    { brand: "Samsung", name: "Galaxy Tab S9", codename: "gts9", model: "" },
    {
      brand: "NoSuchBrand",
      name: "Mystery Phone",
      codename: "mystery",
      model: "",
    },
    { brand: "Google", name: "D", codename: "junk", model: "" },
    {
      brand: "Google",
      name: "Chromecast with Google TV",
      codename: "sabrina",
      model: "",
    },
  ]);

  assert.equal(selection.uniqueDevices, 7);
  assert.equal(selection.exclusions.brand, 1);
  assert.equal(selection.exclusions.name, 1);
  assert.equal(selection.exclusions.formFactor, 1);
  assert.deepEqual(selection.entries.map((entry) => entry.codename).sort(), [
    "eureka",
    "gts9",
    "sabrina",
    "tokay",
  ]);
  const pixel = selection.entries.find((entry) => entry.codename === "tokay");
  assert.deepEqual(pixel?.names, ["Pixel 9", "Pixel 9 Pro"]);
  assert.equal(selection.formFactors.phone, 2);
  assert.equal(selection.formFactors.tv, 1);
  assert.equal(selection.formFactors.tablet, 1);
});
