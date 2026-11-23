import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePixelOS } from "./sources/pixelos.ts";

const raw = JSON.stringify({
  devices: [
    {
      codename: "peridot",
      model: "Redmi Note 13 Pro 5G",
      vendor: "Xiaomi",
      active: true,
      download_link:
        "https://sourceforge.net/projects/pixelos-releases/files/seventeen/peridot/PixelOS_peridot-17.0-20261115-0503.zip",
    },
    // Accepted into the roster, no build yet: pixelos.net/download/infiniti
    // answers "No build available yet." and the SourceForge folder 404s.
    {
      codename: "infiniti",
      model: "OnePlus 15",
      vendor: "OnePlus",
      active: true,
      download_link: "",
    },
    { codename: " ", model: "No codename", active: true, download_link: "x" },
  ],
});

test("PixelOS records a device once it has a build", () => {
  const records = parsePixelOS(raw);
  const peridot = records.find((record) => record.codename === "peridot");

  assert.ok(peridot);
  assert.equal(peridot.hasBuild, true);
  assert.equal(peridot.referenceUrl, "https://pixelos.net/download/peridot");
  assert.equal(peridot.referenceKind, "derived");
  assert.equal(peridot.name, "Redmi Note 13 Pro 5G");
  assert.equal(peridot.brand, "Xiaomi");
  // The dated filename is the build date.
  assert.equal(peridot.buildDate, "2026-11-15");
});

test("PixelOS keeps a roster entry with no build as name evidence only", () => {
  const records = parsePixelOS(raw);
  const infiniti = records.find((record) => record.codename === "infiniti");

  assert.ok(infiniti, "the roster entry still names the device");
  assert.equal(infiniti.hasBuild, false);
  assert.equal(infiniti.name, "OnePlus 15");
  // No build, so no build date.
  assert.equal(infiniti.buildDate, null);
});

test("PixelOS falls back to the published date when the filename has none", () => {
  const records = parsePixelOS(
    JSON.stringify({
      devices: [
        {
          codename: "sunfish",
          model: "Pixel 4a",
          active: true,
          last_updated: "21 August 2024",
          download_link:
            "https://sourceforge.net/projects/pixelos-releases/files/sunfish/PixelOS-sunfish-latest.zip",
        },
      ],
    }),
  );

  // Month names are read by pattern: `Date` would shift the day in some zones.
  assert.equal(records[0]?.buildDate, "2024-08-21");
});
