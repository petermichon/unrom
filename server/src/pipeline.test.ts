import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import Database from "better-sqlite3";

import { buildDatabase } from "./build/database.ts";
import { createApi } from "./data/queries.ts";
import {
  EXCLUDED_CODENAMES,
  canonicalCodename,
  expandCodename,
  variantCodenames,
  vendorForBrand,
} from "./data/identity.ts";
import { createParser, isCitation, selectors } from "./sources/adapter.ts";
import { parseKaliNetHunter } from "./sources/kali-nethunter.ts";
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
  assert.deepEqual(expandCodename("vayu/bhima"), ["vayu", "bhima"]);
  assert.deepEqual(expandCodename("haydnin/haydn"), ["haydnin", "haydn"]);
  assert.deepEqual(expandCodename("raphael/in"), ["raphael"]);
  assert.deepEqual(expandCodename("sapphire/sapphiren"), [
    "sapphire",
    "sapphiren",
  ]);
  assert.deepEqual(expandCodename("ginkgo/willow"), ["ginkgo", "willow"]);
  assert.deepEqual(expandCodename("mojito/sunny"), ["mojito", "sunny"]);
  assert.deepEqual(expandCodename("single"), ["single"]);
  assert.deepEqual(expandCodename("a/b/c"), ["a", "b", "c"]);
});

test("variant codenames only include real devices", () => {
  // A duplicate of the primary or a vendor identifier is not a variant.
  assert.deepEqual(variantCodenames("sweet", "sweetin"), ["sweetin"]);
  assert.deepEqual(variantCodenames("sweet", "sweet/sweetin"), ["sweetin"]);
  assert.deepEqual(variantCodenames("sweet", "sweet"), []);
  assert.deepEqual(variantCodenames("hotdog", "OnePlus7TPro"), []);
  assert.deepEqual(variantCodenames("g", "G"), []);
});

test("Kali variant keys resolve to real codenames", () => {
  const records = parseKaliNetHunter(`
- surya-16:
    model: Xiaomi Poco X3 NFC (PixelOS)
- oneplus-nord:
    model: OnePlus Nord
- oneplus6:
    model: OnePlus 6 / 6T
- stone-crdroid12:
    model: POCO X5 5G
`);
  assert.deepEqual(records.map((record) => record.codename).sort(), [
    "avicii",
    "enchilada",
    "fajita",
    "stone",
    "surya",
  ]);
});

test("Teracube 2e batch codenames resolve", () => {
  // iodéOS `2e` and /e/OS `zirconia` are the same 2020 hardware; `emerald` is
  // the distinct 2021 batch.
  assert.equal(canonicalCodename("teracube", "2e"), "zirconia");
  assert.equal(canonicalCodename("teracube", "emerald"), "emerald");
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

test("reference gate rejects non-citation URLs", () => {
  for (const url of [
    "https://t.me/somegroup",
    "https://telegram.me/somegroup",
    "https://discord.gg/invite",
    "https://example.com/build/rom.zip",
    "https://www.pling.com/p/1234567/",
    "#",
    "not a url",
    null,
  ]) {
    assert.equal(isCitation(url), false, `${url} should not be a citation`);
  }

  for (const url of [
    "https://evolution-x.org/device/stone",
    "https://xdaforums.com/t/rom-some-device.123/",
    "https://wiki.lineageos.org/devices/stone/",
  ]) {
    assert.equal(isCitation(url), true, `${url} should be a citation`);
  }
});

test("shared raw references fall through to the reference page", () => {
  const parse = createParser({
    id: "test",
    romName: "Test",
    file: "test.json",
    select: selectors.array,
    referenceUrl: ["thread", "source"],
    referencePage: "https://example.com/{codename}",
  });

  const records = parse(
    JSON.stringify([
      { codename: "shared-a", thread: "https://example.com/one" },
      { codename: "shared-b", thread: "https://example.com/one" },
      { codename: "unique", thread: "https://xdaforums.com/t/unique.1/" },
      { codename: "contact", thread: "https://t.me/group" },
      {
        codename: "fallback",
        thread: "https://t.me/group",
        source: "https://example.com/pinned/fallback",
      },
    ]),
  );

  const byCodename = new Map(
    records.map((record) => [record.codename, record.referenceUrl]),
  );
  assert.equal(byCodename.get("shared-a"), "https://example.com/shared-a");
  assert.equal(byCodename.get("shared-b"), "https://example.com/shared-b");
  assert.equal(byCodename.get("unique"), "https://xdaforums.com/t/unique.1/");
  assert.equal(byCodename.get("contact"), "https://example.com/contact");
  assert.equal(
    byCodename.get("fallback"),
    "https://example.com/pinned/fallback",
  );
});

test("renamed codenames resolve to the canonical device", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const result = buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    // LineageOS calls the Xiaomi Mi 8 SE `xmsirius`; `sirius` is a rename.
    const alias = result.aliases.find((entry) => entry.alias === "sirius");
    assert.ok(alias, "sirius alias missing");
    assert.equal(alias.vendor, "xiaomi");
    assert.equal(alias.codename, "xmsirius");

    const device = api.getDevice("xiaomi", "sirius");
    assert.equal(device?.codename, "xmsirius");
    assert.ok(device?.aliases.includes("sirius"));

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("variant codenames stay distinct and record their main", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const result = buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    // `sweetin` is a real variant, not a rename: it is not an alias.
    assert.equal(
      result.aliases.some((entry) => entry.alias === "sweetin"),
      false,
    );

    const variant = api.getDevice("xiaomi", "sweetin");
    assert.equal(variant?.codename, "sweetin");
    assert.equal(variant?.variantOf, "sweet");
    // Coverage is device-level: the variant inherits every `sweet` build.
    const main = api.getDevice("xiaomi", "sweet");
    assert.ok(main?.variants.includes("sweetin"));
    assert.ok(
      (variant?.roms.length ?? 0) > (main?.roms.length ?? 0) - 1,
      "variant should inherit the main's ROMs",
    );
    assert.ok(
      variant?.roms.some((rom) => rom.inheritedFrom === "sweet"),
      "variant ROMs should record their covering target",
    );
    assert.ok(main?.roms.every((rom) => rom.inheritedFrom === null));

    // Search finds the variant as its own device.
    assert.deepEqual(
      api.listDevices("sweetin").map((entry) => entry.codename),
      ["sweetin"],
    );

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
