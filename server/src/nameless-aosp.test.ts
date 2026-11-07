import assert from "node:assert/strict";
import { test } from "node:test";

import { parseNamelessAosp } from "./sources/nameless-aosp.ts";

test("Nameless AOSP parses both SourceForge listings", () => {
  const records = parseNamelessAosp(`
<a href="/projects/nameless-aosp/files/instantnoodle/">instantnoodle/</a>
<a href="/projects/nameless-aosp/files/instantnoodle-oos11/">instantnoodle-oos11/</a>
<a href="/projects/nameless-aosp/files/instantnoodle/stats/timeline">stats</a>
<a href="/projects/nameless-aosp/files/latest/download">latest</a>
<a href="/projects/nameless-aosp/files/WIP/">WIP/</a>
<a href="/projects/nameless-aosp/files/lahaina/">lahaina/</a>
<a href="/projects/nameless-clo/files/aston/">aston/</a>
<a href="/projects/nameless-clo/files/instantnoodle/">instantnoodle/</a>
`);

  assert.deepEqual(
    records.map((record) => record.codename),
    ["instantnoodle", "aston"],
  );
  assert.equal(
    records[0]?.referenceUrl,
    "https://sourceforge.net/projects/nameless-aosp/files/instantnoodle/",
  );
  assert.equal(
    records[1]?.referenceUrl,
    "https://sourceforge.net/projects/nameless-clo/files/aston/",
  );
});
