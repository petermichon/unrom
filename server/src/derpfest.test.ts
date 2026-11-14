import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveReference } from "./ingest/fetch/derpfest.ts";

test("a build URL cites the device folder, not the dated build", () => {
  assert.equal(
    deriveReference(
      "https://sourceforge.net/projects/derpfest/files/sunfish/20231121-0141/DerpFest-13-Official-Tango-sunfish-20231121-0141.zip/download",
    ),
    "https://sourceforge.net/projects/derpfest/files/sunfish/",
  );
});

test("a URL outside SourceForge falls back to the pinned index", () => {
  assert.equal(
    deriveReference("https://example.com/build.zip"),
    "https://derpfest.org/devices-index.json",
  );
});
