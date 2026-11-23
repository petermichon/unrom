import assert from "node:assert/strict";
import { test } from "node:test";

import { ROM_SOURCE_URLS } from "./data/rom-sources.ts";
import { ROMS } from "./data/roms.ts";

test("every recorded ROM source is a catalogue id and a code-host page", () => {
  // The record only holds the project's own page; a file inside it would go
  // stale, and a link farm is not a source.
  const hosts = new Set(["github.com", "gitlab.com", "gitlab.e.foundation"]);

  for (const [id, url] of Object.entries(ROM_SOURCE_URLS)) {
    assert.ok(ROMS[id], `${id} is not in the ROM catalogue`);

    const parsed = new URL(url);
    assert.equal(parsed.protocol, "https:", url);
    assert.ok(hosts.has(parsed.hostname), `${url} is not a code host`);
    assert.equal(parsed.search, "", `${url} should not carry a query`);
  }
});
