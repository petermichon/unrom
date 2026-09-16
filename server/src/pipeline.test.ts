import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import Database from "better-sqlite3";

import { buildDatabase } from "./build/database.ts";
import { ALLOWED_EMPTY_FILES, sources } from "./sources/registry.ts";
import { listDataFiles, parseAllSources, validateSources } from "./validate.ts";

test("every source parses and yields records", async () => {
  const results = await validateSources();
  for (const result of results) {
    assert.equal(result.error, undefined, `${result.file}: ${result.error}`);
    assert.ok(
      result.records > 0 || ALLOWED_EMPTY_FILES.has(result.file),
      `${result.file} produced no records`,
    );
  }
});

test("every raw data file has a normalizer", async () => {
  const covered = new Set(sources.map((source) => source.file));
  const uncovered = (await listDataFiles()).filter(
    (file) => !covered.has(file),
  );
  assert.deepEqual(
    uncovered,
    [],
    `uncovered data files: ${uncovered.join(", ")}`,
  );
});

test("build produces a consistent dataset", async () => {
  const records = await parseAllSources();
  assert.ok(records.length > 0, "no records parsed");

  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const result = buildDatabase(records, dbPath);
    assert.ok(result.romCount > 0, "no roms");
    assert.ok(result.deviceCount > 0, "no devices");
    assert.ok(result.edgeCount > 0, "no edges");

    const db = new Database(dbPath, { readonly: true });
    const count = (sql: string) => (db.prepare(sql).get() as { c: number }).c;

    assert.equal(
      count(
        "select count(*) c from (select rom_id, codename from rom_devices group by 1,2 having count(*) > 1)",
      ),
      0,
      "duplicate edges",
    );
    assert.equal(
      count(
        "select count(*) c from rom_device_versions v left join rom_devices e on e.rom_id = v.rom_id and e.codename = v.codename where e.rom_id is null",
      ),
      0,
      "versions without an edge",
    );
    assert.equal(
      count(
        "select count(*) c from aliases a left join devices d on d.codename = a.codename where d.codename is null",
      ),
      0,
      "aliases without a device",
    );
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
