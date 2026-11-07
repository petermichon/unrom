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
  assert.equal(
    records[0]?.referenceUrl,
    "https://axpos.org/devices/fairphone/fp3/",
  );
});
