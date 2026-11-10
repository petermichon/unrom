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
  isExcludedCodename,
  isValidCodename,
  vendorForBrand,
} from "./data/identity.ts";
import { DEVICE_NAMES } from "./data/registry.ts";
import { PLAY_DEVICES_FILE } from "./sources/play-devices.ts";
import {
  buildRecord,
  createParser,
  isCitation,
  selectors,
} from "./sources/adapter.ts";
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
    (file) => !covered.has(file) && file !== PLAY_DEVICES_FILE,
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

    // The registry owns casing. A source spelling (`fp3`) and the curated one
    // (`FP3`) must resolve to one device, or the empty row shadows the coverage.
    assert.deepEqual(
      db
        .prepare(
          "select vendor, lower(codename) as codename, count(*) as n from devices group by vendor, lower(codename) having n > 1",
        )
        .all(),
      [],
      "case-only duplicate devices",
    );
    const fp3 = db
      .prepare(
        "select codename, name, covered from devices where vendor = 'fairphone' and lower(codename) = 'fp3'",
      )
      .all() as Array<{ codename: string; name: string; covered: number }>;
    assert.equal(fp3.length, 1, "one Fairphone 3 device");
    assert.equal(fp3[0].codename, "FP3");
    assert.equal(fp3[0].name, "Fairphone 3");
    assert.equal(fp3[0].covered, 1, "Fairphone 3 keeps its ROM builds");

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
  assert.equal(vendorForBrand("Amazon"), "amazon");
  assert.equal(vendorForBrand("SDMC"), "sdmc");
  assert.equal(vendorForBrand("Ulefone"), "ulefone");
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

test("retired roster entries are dropped", () => {
  const parse = createParser({
    id: "test",
    romName: "Test",
    file: "test.json",
    select: selectors.devices("devices", { enabledKey: "enabled" }),
  });

  const records = parse(
    JSON.stringify({
      devices: [
        { codename: "live", enabled: true },
        { codename: "retired", enabled: false },
        { codename: "unstated" },
      ],
    }),
  );

  assert.deepEqual(
    records.map((record) => record.codename),
    ["live", "unstated"],
  );
});

test("built references are marked derived, published ones observed", () => {
  const template = createParser({
    id: "test",
    romName: "Test",
    file: "test.json",
    select: selectors.array,
    referencePage: "https://example.com/devices/{codename}",
  });
  const [derived] = template(JSON.stringify([{ codename: "alpha" }]));
  assert.equal(derived.referenceUrl, "https://example.com/devices/alpha");
  assert.equal(derived.referenceKind, "derived");

  const published = createParser({
    id: "test",
    romName: "Test",
    file: "test.json",
    select: selectors.array,
    referenceUrl: ["thread"],
    referencePage: "https://example.com/devices/{codename}",
  });
  const [observed] = published(
    JSON.stringify([{ codename: "beta", thread: "https://example.com/beta" }]),
  );
  assert.equal(observed.referenceUrl, "https://example.com/beta");
  assert.equal(observed.referenceKind, "observed");
});

test("dead derived citations are dropped, observed ones kept", () => {
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    buildDatabase(
      [
        buildRecord({
          romId: "r1",
          romName: "R1",
          codename: "deadpool",
          referenceUrl: "https://example.com/deadpool",
          referenceKind: "derived",
        }),
        buildRecord({
          romId: "r2",
          romName: "R2",
          codename: "alpha",
          referenceUrl: "https://example.com/alpha",
          referenceKind: "observed",
        }),
      ],
      dbPath,
      [],
      new Set(["https://example.com/deadpool", "https://example.com/alpha"]),
    );

    const db = new Database(dbPath, { readonly: true });
    const row = (romId: string) =>
      db
        .prepare(
          "select reference_url url, reference_kind kind from rom_devices where rom_id = ?",
        )
        .get(romId) as { url: string | null; kind: string };

    assert.deepEqual(row("r1"), { url: null, kind: "derived" });
    assert.deepEqual(row("r2"), {
      url: "https://example.com/alpha",
      kind: "observed",
    });
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("source corrections fix upstream mislabels", () => {
  const parse = createParser({
    id: "test",
    romName: "Test",
    file: "test.json",
    select: selectors.array,
    brand: ["brand"],
    codenameCorrections: { davinci: "AI2202_QLC" },
    brandCorrections: { payton: "Motorola" },
  });

  const records = parse(
    JSON.stringify([
      { codename: "davinci", brand: "Asus", name: "Zenfone 9" },
      { codename: "payton", brand: "Xiaomi", name: "Moto X4" },
    ]),
  );

  assert.deepEqual(
    records.map((record) => [record.codename, record.brand]),
    [
      ["AI2202_QLC", "Asus"],
      ["payton", "Motorola"],
    ],
  );
});

test("malformed codenames are rejected", () => {
  assert.equal(isValidCodename("X1 - (6781)"), false);
  assert.equal(isValidCodename("AI2202_QLC"), true);
  assert.equal(isValidCodename("davinci"), true);
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

test("compatibility groups share one build's coverage", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const result = buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    // `sweetin` is a group member, not a rename.
    assert.equal(
      result.aliases.some((entry) => entry.alias === "sweetin"),
      false,
    );

    const sweet = api.getDevice("xiaomi", "sweet");
    const sweetin = api.getDevice("xiaomi", "sweetin");
    assert.deepEqual(sweet?.group, ["sweet", "sweetin"]);
    assert.deepEqual(sweetin?.group, ["sweet", "sweetin"]);
    // Every member inherits the group's ROMs, so the sets are equal.
    assert.equal(sweet?.roms.length, sweetin?.roms.length);
    assert.ok(
      sweetin?.roms.some((rom) => rom.inheritedFrom === "sweet"),
      "members should record the covering codename",
    );

    // `mojito`/`sunny` is symmetric: both trees assert both codenames.
    const mojito = api.getDevice("xiaomi", "mojito");
    const sunny = api.getDevice("xiaomi", "sunny");
    assert.deepEqual(mojito?.group, ["mojito", "sunny"]);
    assert.deepEqual(sunny?.group, ["mojito", "sunny"]);
    assert.equal(mojito?.roms.length, sunny?.roms.length);

    // Search finds each member as its own device.
    assert.deepEqual(
      api.listDevices("sweetin").map((entry) => entry.codename),
      ["sweetin"],
    );

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("canonical names come from the registry", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    // One codename can name several models; the first is the display name.
    const sweet = api.getDevice("xiaomi", "sweet");
    assert.deepEqual(sweet?.names, [
      "Redmi Note 10 Pro",
      "Redmi Note 10 Pro Max",
    ]);
    assert.equal(sweet?.name, "Redmi Note 10 Pro");

    // A device no roster names still gets its canonical name.
    assert.equal(api.getDevice("xiaomi", "elish")?.name, "Xiaomi Pad 5 Pro");

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("search groups devices, brands and ROMs", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    const empty = api.search("   ");
    assert.deepEqual(empty.totals, { devices: 0, brands: 0, roms: 0 });

    const sweet = api.search("sweet");
    assert.ok(sweet.devices.length > 0);
    assert.ok(sweet.devices.some((device) => device.codename === "sweet"));
    assert.ok(sweet.roms.length > 0);
    assert.ok(sweet.roms.every((rom) => rom.deviceCount > 0));
    assert.ok(
      sweet.devices.every((device) =>
        [device.name ?? "", device.codename, device.vendor]
          .join(" ")
          .toLowerCase()
          .includes("sweet"),
      ),
    );

    const xiaomi = api.search("xiaomi");
    assert.ok(xiaomi.brands.some((brand) => brand.vendor === "xiaomi"));

    const catalogue = api.search("aokp");
    assert.equal(catalogue.totals.devices, 0);
    assert.equal(catalogue.roms[0]?.name, "AOKP");
    assert.equal(catalogue.roms[0]?.deviceCount, 0);

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("registry-only devices ship with zero ROMs", () => {
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const built = buildDatabase([], dbPath);
    assert.equal(built.deviceCount, Object.keys(DEVICE_NAMES).length);

    const api = createApi(dbPath);
    const devices = api.listDevices();
    assert.equal(devices.length, Object.keys(DEVICE_NAMES).length);

    // A curated device no roster reports is still part of the catalogue.
    const madrid = api.getDevice("huawei", "madrid");
    assert.equal(madrid?.name, "Huawei Y6 (2019)");
    assert.equal(madrid?.roms.length, 0);
    assert.equal(madrid?.confidence, "unverified");
    assert.deepEqual(madrid?.sources, []);

    const listed = devices.find((device) => device.codename === "madrid");
    assert.deepEqual(listed?.roms, []);
    assert.equal(listed?.confidence, "unverified");
    assert.equal(listed?.name, "Huawei Y6 (2019)");

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("device pages filter by letter and offset", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const built = buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    const firstX = api.listDevicesPage({ letter: "X", limit: 5 });
    assert.equal(firstX.length, 5);
    assert.ok(
      firstX.every((device) =>
        (device.name ?? device.codename).toUpperCase().startsWith("X"),
      ),
    );

    const xTotal = api.countDevices({ letter: "X" });
    assert.ok(xTotal > 5);
    assert.equal(api.listDevicesPage({ letter: "X" }).length, xTotal);

    const secondX = api.listDevicesPage({
      letter: "X",
      limit: 5,
      offset: 5,
    });
    assert.notDeepEqual(
      firstX.map((device) => device.codename),
      secondX.map((device) => device.codename),
    );

    const numeric = api.listDevicesPage({ letter: "#", limit: 5 });
    assert.ok(numeric.length > 0);
    assert.ok(
      numeric.every(
        (device) => !/^[A-Za-z]/.test(device.name ?? device.codename),
      ),
    );

    assert.equal(
      api.listDevicesPage({ vendor: "xiaomi" }).length,
      api.countDevices({ vendor: "xiaomi" }),
    );

    // Directory pages put ROM-covered devices first, so the first page is
    // useful even when the catalogue tail has no builds.
    const huawei = api.listDevicesPage({ vendor: "huawei" });
    assert.ok(huawei.some((device) => device.roms.length > 0));
    assert.ok(huawei.some((device) => device.roms.length === 0));
    let sawEmptyDevice = false;
    for (const device of huawei) {
      if (device.roms.length === 0) sawEmptyDevice = true;
      else
        assert.equal(sawEmptyDevice, false, "covered device after empty one");
    }

    // No limit keeps the previous full-list behaviour; the page size is capped.
    assert.equal(api.listDevices().length, built.deviceCount);
    assert.equal(api.listDevicesPage({ limit: 1000 }).length, 200);
    assert.equal(
      api.listDevicesPage({ offset: built.deviceCount - 2 }).length,
      2,
    );

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the registry report flags curated entries that miss source names", () => {
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const built = buildDatabase(
      [
        buildRecord({
          romId: "lineageos",
          romName: "LineageOS",
          codename: "otter",
          name: "SHIFTphone 8.0",
          names: ["SHIFTphone 8.0", "SHIFTphone 8.1", "SHIFTphone 9"],
          brand: "SHIFT",
        }),
      ],
      dbPath,
    );

    const gap = built.registryReport.nameGaps.find(
      (entry) => entry.codename === "otter",
    );
    assert.deepEqual(gap?.curated, ["SHIFTphone 8.0", "SHIFTphone 8.1"]);
    assert.deepEqual(gap?.observed, ["SHIFTphone 9"]);
    assert.equal(
      built.registryReport.summary.nameGaps,
      built.registryReport.nameGaps.length,
    );

    // Curated names still win, and both models are listed.
    const db = new Database(dbPath, { readonly: true });
    const device = db
      .prepare("select name, names from devices where codename = 'otter'")
      .get() as { name: string; names: string };
    assert.equal(device.name, "SHIFTphone 8.0");
    assert.deepEqual(JSON.parse(device.names), [
      "SHIFTphone 8.0",
      "SHIFTphone 8.1",
    ]);
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("devices outside the registry stay unnamed", () => {
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const built = buildDatabase(
      [
        {
          romId: "test",
          romName: "Test ROM",
          codename: "uncurateddevice",
          name: "Source Model Name",
          names: ["Source Model Name"],
          brand: null,
          referenceUrl: null,
          referenceKind: "observed",
          reportedCodename: null,
        },
      ],
      dbPath,
    );

    const db = new Database(dbPath, { readonly: true });
    const device = db
      .prepare("select name, names from devices where codename = ?")
      .get("uncurateddevice") as { name: string | null; names: string | null };
    assert.equal(device.name, null);
    assert.equal(device.names, null);

    // The report still surfaces the source name as a curation candidate.
    assert.equal(built.registryReport.summary.sourceNamed, 1);
    assert.equal(built.registryReport.summary.unnamed, 0);
    assert.equal(built.registryReport.candidates[0]?.name, "Source Model Name");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the registry exposes every curated entry", async () => {
  const records = await parseAllSources();
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const built = buildDatabase(records, dbPath);
    const api = createApi(dbPath);

    const entries = api.listRegistry();
    assert.equal(entries.length, Object.keys(DEVICE_NAMES).length);

    // The curation report covers every device that is not curated.
    const report = built.registryReport;
    assert.equal(report.summary.registryEntries, entries.length);
    assert.equal(
      report.summary.curated +
        report.summary.sourceNamed +
        report.summary.unnamed,
      report.summary.devices,
    );
    assert.equal(report.summary.devices, built.deviceCount);
    assert.equal(
      report.candidates.length,
      report.summary.devices - report.summary.curated,
    );
    assert.equal(
      report.summary.suspicious,
      report.candidates.filter((candidate) => candidate.suspicious).length,
    );
    for (const candidate of report.candidates) {
      assert.equal(
        candidate.suspicious,
        candidate.issues.length > 0,
        `${candidate.vendor}/${candidate.codename}`,
      );
    }
    assert.equal(
      report.candidates.some((candidate) => candidate.codename === "sweet"),
      false,
      "curated devices are not candidates",
    );
    for (const conflict of report.conflicts) {
      assert.ok(conflict.sources.length > 1);
      assert.ok(
        new Set(conflict.sources.map((source) => source.name)).size > 1,
      );
    }

    const sweet = entries.find(
      (entry) => entry.vendor === "xiaomi" && entry.codename === "sweet",
    );
    assert.deepEqual(sweet?.names, [
      "Redmi Note 10 Pro",
      "Redmi Note 10 Pro Max",
    ]);
    assert.equal(sweet?.name, "Redmi Note 10 Pro");
    assert.equal(sweet?.supported, true);
    assert.ok(sweet?.sources.length);
    assert.ok(
      ["verified", "inferred", "manual", "unverified"].includes(
        sweet?.confidence ?? "",
      ),
    );

    // Registry-only entries are unverified and have no sources.
    const eos = entries.find(
      (entry) => entry.vendor === "xiaomi" && entry.codename === "eos",
    );
    assert.equal(eos?.supported, false);
    assert.equal(eos?.confidence, "unverified");
    assert.deepEqual(eos?.sources, []);

    // Lookup works in both directions through the search filter.
    assert.deepEqual(
      api.listRegistry("sweetin").map((entry) => entry.codename),
      ["sweetin"],
    );
    assert.deepEqual(
      api.listRegistry(undefined, "xiaomi").map((entry) => entry.vendor),
      Array(entries.filter((entry) => entry.vendor === "xiaomi").length).fill(
        "xiaomi",
      ),
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
    // GSI targets are matched by shape, not only by the literal list.
    for (const codename of ["gsi", "gsi_gapps", "treble_gsi", "gsi_arm64"]) {
      assert.equal(isExcludedCodename(codename), true, codename);
      assert.equal(
        db.prepare("select 1 from devices where codename = ?").get(codename),
        undefined,
        `GSI became a device: ${codename}`,
      );
    }
    assert.equal(
      db.prepare("select 1 from devices where vendor = 'generic'").get(),
      undefined,
      "generic vendor namespace leaked into devices",
    );
    // Entries retired upstream (`enabled: false`) are not supported devices.
    assert.equal(
      db
        .prepare(
          "select 1 from rom_devices where rom_id = 'mistos' and codename = 'Pong'",
        )
        .get(),
      undefined,
      "a disabled roster entry became a supported device",
    );
    db.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("brand and letter summaries cover the whole catalogue", () => {
  const dir = mkdtempSync(join(tmpdir(), "unrom-test-"));
  const dbPath = join(dir, "unrom.sqlite");

  try {
    const built = buildDatabase([], dbPath, [
      { vendor: "google", codename: "catalog_only", names: ["Catalog Only"] },
      { vendor: "realme", codename: "cjk_test", names: ["真我 GT"] },
      { vendor: "realme", codename: "digit_test", names: ["10.or G"] },
    ]);
    const api = createApi(dbPath);

    const brands = api.listBrands();
    const google = brands.find((brand) => brand.vendor === "google");
    assert.ok(google);
    assert.ok(google.deviceCount >= 1);
    assert.ok(google.withRoms <= google.deviceCount);
    assert.equal(
      brands.reduce((sum, brand) => sum + brand.deviceCount, 0),
      built.deviceCount,
    );
    assert.ok(brands.every((brand) => brand.withRoms <= brand.deviceCount));

    const letters = api.letterCounts();
    assert.equal(
      letters.reduce((sum, letter) => sum + letter.deviceCount, 0),
      built.deviceCount,
    );
    assert.equal(letters.at(-1)?.letter, "other");
    assert.equal(
      letters.reduce((sum, letter) => sum + letter.withRoms, 0),
      0,
    );

    const cjk = api.listDevicesPage({ letter: "other" });
    assert.ok(cjk.some((device) => device.codename === "cjk_test"));
    assert.ok(!cjk.some((device) => device.codename === "digit_test"));
    const numeric = api.listDevicesPage({ letter: "#" });
    assert.ok(numeric.some((device) => device.codename === "digit_test"));
    assert.ok(!numeric.some((device) => device.codename === "cjk_test"));

    const summary = api.getSummary();
    assert.equal(summary.deviceCount, built.deviceCount);
    assert.equal(summary.brandCount, brands.length);
    assert.equal(summary.romCount, api.listRoms().length);
    assert.equal(
      summary.coveredRomCount,
      api.listRoms().filter((rom) => rom.deviceCount > 0).length,
    );
    assert.deepEqual(summary.topDevices, []);

    assert.equal(api.getDevice("google", "catalog_only")?.name, "Catalog Only");

    api.close();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
