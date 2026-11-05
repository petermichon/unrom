import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

import { ROMS } from "./data/roms.ts";
import { sources } from "./sources/registry.ts";

test("every ROM source has a catalog entry with the same name", () => {
  for (const source of sources) {
    const entry = ROMS[source.id];
    assert.ok(entry, `add ${source.id} to data/roms.ts`);
    assert.equal(entry.name, source.romName, `name mismatch for ${source.id}`);
  }
});

test("catalog ids are lowercase slugs", () => {
  for (const id of Object.keys(ROMS)) {
    assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad catalog id: ${id}`);
  }
});

test("ROM_COVERAGE.md and the catalog name the same ROMs", () => {
  const coverage = readFileSync(
    new URL("../../ROM_COVERAGE.md", import.meta.url),
    "utf8",
  )
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) =>
      line
        .slice(2)
        .replace(/^(🟢|❌)\s+/, "")
        .trim(),
    );

  const normalize = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const catalog = new Set(
    Object.values(ROMS).map((rom) => normalize(rom.name)),
  );

  for (const name of coverage) {
    assert.ok(catalog.has(normalize(name)), `${name} is not in data/roms.ts`);
  }
  assert.equal(coverage.length, catalog.size, "counts differ");
});
