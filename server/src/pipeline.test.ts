import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import Database from "better-sqlite3";

import { buildDatabase } from "./build/database.ts";
import {
  EXCLUDED_CODENAMES,
  expandCodename,
  vendorForBrand,
} from "./data/identity.ts";
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
        "select count(*) c from (select rom_id, vendor, codename from rom_devices group by 1,2,3 having count(*) > 1)",
      ),
      0,
      "duplicate edges",
    );
    assert.equal(
      count("select count(*) c from devices where codename like '%/%'"),
      0,
      "combined codenames became devices",
    );

    // Alias resolution is emitted as an artifact; every alias must resolve to a
    // device that actually exists.
    for (const alias of result.aliases) {
      const found = db
        .prepare("select 1 from devices where vendor = ? and codename = ?")
        .get(alias.vendor, alias.codename);
      assert.ok(found, `alias ${alias.alias} points at a missing device`);
    }
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("combined codenames expand to real devices", () => {
  assert.deepEqual(expandCodename("vayu/bhima"), ["vayu"]);
  assert.deepEqual(expandCodename("haydnin/haydn"), ["haydn"]);
  assert.deepEqual(expandCodename("raphael/in"), ["raphael"]);
  assert.deepEqual(expandCodename("sapphire/sapphiren"), ["sapphire"]);
  assert.deepEqual(expandCodename("ginkgo/willow"), ["ginkgo"]);
  assert.deepEqual(expandCodename("mojito/sunny"), ["mojito", "sunny"]);
  assert.deepEqual(expandCodename("single"), ["single"]);
  assert.deepEqual(expandCodename("a/b/c"), ["a", "b", "c"]);
});

test("brands map to manufacturers", () => {
  assert.equal(vendorForBrand("Poco"), "xiaomi");
  assert.equal(vendorForBrand("POCO"), "xiaomi");
  assert.equal(vendorForBrand("Redmi"), "xiaomi");
  assert.equal(vendorForBrand("Xiaomi"), "xiaomi");
  assert.equal(vendorForBrand("realme"), "realme");
  assert.equal(vendorForBrand("ZUK"), "lenovo");
  assert.equal(vendorForBrand("LGE"), "lg");
  assert.equal(vendorForBrand(null), null);
});

test("cross-vendor collisions resolve to distinct devices", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    buildDatabase(records, dbPath);
    const db = new Database(dbPath, { readonly: true });
    const vendors = (codename: string) =>
      (
        db
          .prepare(
            "select vendor from devices where codename = ? order by vendor",
          )
          .all(codename) as Array<{ vendor: string }>
      ).map((row) => row.vendor);

    // `sirius` is Sony's Xperia Z2; Xiaomi's Mi 8 SE is aliased to `xmsirius`.
    assert.deepEqual(vendors("sirius"), ["sony"]);
    assert.deepEqual(vendors("xmsirius"), ["xiaomi"]);

    // A Xiaomi Mi 8 SE PixelExperience edge must land on `xmsirius`.
    const onXmsirius = db
      .prepare(
        "select count(*) c from rom_devices where codename = 'xmsirius' and rom_id = 'pixelexperience'",
      )
      .get() as { c: number };
    assert.equal(onXmsirius.c, 1);

    // `tulip` and `oscar` are shared across vendors and must stay separate. The
    // brand-less records for them are seeded to their known vendor.
    assert.deepEqual(vendors("tulip"), ["xiaomi", "zte"]);
    assert.deepEqual(vendors("oscar"), ["oneplus", "realme"]);

    // No record is left unattributed: every codename resolves to a vendor.
    const unknown = db
      .prepare("select codename from devices where vendor = 'unknown'")
      .all() as Array<{ codename: string }>;
    assert.deepEqual(unknown, [], "unattributed devices remain");

    // Emulator images and unified build targets never become devices.
    for (const codename of EXCLUDED_CODENAMES) {
      const found = db
        .prepare("select 1 from devices where codename = ?")
        .get(codename);
      assert.equal(
        found,
        undefined,
        `excluded codename became a device: ${codename}`,
      );
    }
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
