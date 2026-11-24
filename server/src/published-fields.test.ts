import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { DATA_DIR } from "./paths.ts";
import { EXPECTED_FIELDS, sources } from "./sources/registry.ts";

type Fact = "buildDate" | "securityPatch";

const LABEL: Record<Fact, string> = {
  buildDate: "build date",
  securityPatch: "security patch level",
};

// A source can keep fetching fine while the field the parser keys on moves or
// disappears. That would turn a fact into `null` across the dataset without a
// single test failing, so the snapshot is checked against what it is known to
// carry.
test("every declared fact still parses from its snapshot", async () => {
  for (const [file, facts] of Object.entries(EXPECTED_FIELDS)) {
    const source = sources.find((entry) => entry.file === file);
    assert.ok(source, `${file} declares expected facts but no source reads it`);

    const raw = await readFile(join(DATA_DIR, file), "utf8");
    const records = source.parse(raw);
    assert.ok(records.length > 0, `${file}: parsed no records`);

    for (const fact of Object.keys(facts) as Fact[]) {
      if (!facts[fact]) continue;
      const found = records.filter((record) => record[fact]).length;
      assert.ok(
        found > 0,
        `${file}: no ${LABEL[fact]} parsed from ${records.length} record(s); the upstream shape or wording changed. If the source stopped publishing it, remove it from EXPECTED_FIELDS in sources/registry.ts.`,
      );
    }
  }
});
