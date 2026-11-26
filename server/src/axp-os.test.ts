import assert from "node:assert/strict";
import { test } from "node:test";

import { parseAxpOs } from "./sources/axp-os.ts";

test("AXP.OS parses device pages from the sitemap", () => {
  const records = parseAxpOs(`<?xml version="1.0" encoding="utf-8"?>
<urlset>
  <url><loc>https://axpos.org/devices/fairphone/fp3/</loc></url>
  <url><loc>https://axpos.org/devices/google/oriole/</loc></url>
  <url><loc>https://axpos.org/devices/changelogs/2026/</loc></url>
  <url><loc>https://axpos.org/docs/overview/</loc></url>
</urlset>`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["fp3", "oriole"],
  );
  assert.deepEqual(
    records.map((record) => record.brand),
    ["fairphone", "google"],
  );
  // The site page is gone, so cite the file the page was generated from. The
  // mirror's paths are case-sensitive, so the curated spelling is used.
  assert.equal(
    records[0]?.referenceUrl,
    "https://github.com/AXP-OS/axpos-org/blob/hugo/content/devices/Fairphone/FP3.md",
  );
  assert.equal(
    records[1]?.referenceUrl,
    "https://github.com/AXP-OS/axpos-org/blob/hugo/content/devices/Google/oriole.md",
  );
});

test("AXP.OS leaves a device uncited when the mirror has no section for it", () => {
  const records = parseAxpOs(
    `<urlset><url><loc>https://axpos.org/devices/nothing/phone1/</loc></url></urlset>`,
  );

  assert.equal(records[0]?.referenceUrl, null);
});
