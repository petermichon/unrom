import assert from "node:assert/strict";
import { test } from "node:test";

import type { RegistryReport } from "./build/database.ts";
import { formatSummary, formatVendor } from "./build/registry-suggest.ts";

const conflict = {
  vendor: "asus",
  vendorName: "Asus",
  codename: "I001D",
  name: "ROG Phone 2",
  sources: [
    { name: "ROG Phone 2", romIds: ["lineageos"] },
    { name: "ROG 2", romIds: ["blissroms"] },
  ],
  conflict: true,
  suspicious: false,
  issues: [],
};

const report: RegistryReport = {
  summary: {
    devices: 3,
    registryEntries: 1,
    curated: 0,
    fallback: 2,
    unnamed: 1,
    conflicts: 1,
    suspicious: 1,
  },
  candidates: [
    {
      vendor: "amazon",
      vendorName: "Amazon",
      codename: "sunstone",
      name: "Fire Max 11",
      sources: [{ name: "Fire Max 11", romIds: ["lineageos"] }],
      conflict: false,
      suspicious: false,
      issues: [],
    },
    conflict,
    {
      vendor: "asus",
      vendorName: "Asus",
      codename: "X00T",
      name: "X00T",
      sources: [{ name: "X00T", romIds: ["lineageos"] }],
      conflict: false,
      suspicious: true,
      issues: ["same as codename"],
    },
  ],
  conflicts: [conflict],
  coverage: [],
};

test("suggestions emit ready entries and keep conflicts commented", () => {
  const amazon = formatVendor(report, "amazon");
  assert.match(amazon, /"amazon\\0sunstone": \["Fire Max 11"\]/);

  const asus = formatVendor(report, "asus");
  assert.match(asus, /\/\/ "asus\\0I001D"/);
  assert.match(asus, /"ROG Phone 2"/);
  assert.match(asus, /"ROG 2"/);
  assert.match(asus, /\/\/ "asus\\0X00T"/);
  assert.match(asus, /same as codename/);
  assert.doesNotMatch(asus, /^  "asus/m);
});

test("summary lists vendors and candidate counts", () => {
  const summary = formatSummary(report);
  assert.match(summary, /3 uncurated device\(s\), 1 conflict\(s\)/);
  assert.match(summary, /Amazon/);
  assert.match(summary, /Asus/);
  assert.match(summary, /registry:suggest/);
});
