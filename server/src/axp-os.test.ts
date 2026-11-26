import assert from "node:assert/strict";
import { test } from "node:test";

import { parseAxpOs } from "./sources/axp-os.ts";

const TREE = JSON.stringify({
  tree: [
    { type: "blob", path: "content/devices/Fairphone/FP3.md" },
    { type: "blob", path: "content/devices/Fairphone/_index.md" },
    { type: "blob", path: "content/devices/Google/oriole.md" },
    { type: "blob", path: "content/devices/Sony/_index.md" },
    { type: "blob", path: "content/devices/changelogs/2026.md" },
    { type: "blob", path: "content/devices/fp_FP3_slim" },
    { type: "blob", path: "content/devices/install_g4.guide" },
    { type: "tree", path: "content/devices/Samsung" },
    { type: "blob", path: "content/docs/overview.md" },
  ],
});

test("AXP.OS reads one device per markdown file in the site mirror", () => {
  const records = parseAxpOs(TREE);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["FP3", "oriole"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["fairphone", "google"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/AXP-OS/axpos-org/blob/hugo/content/devices/Fairphone/FP3.md",
  );
  assert.equal(
    records[1]?.referenceUrl,
    "https://github.com/AXP-OS/axpos-org/blob/hugo/content/devices/Google/oriole.md",
  );
});

test("AXP.OS ignores index pages, variant builds and guides", () => {
  const records = parseAxpOs(TREE);
  const codenames = new Set(records.map((record) => record.codename));

  assert.equal(records.length, 2);
  assert.equal(codenames.has("_index"), false);
  assert.equal(codenames.has("2026"), false);
  assert.equal(codenames.has("fp_FP3_slim"), false);
  assert.equal(codenames.has("install_g4"), false);
});
