import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveRelock, type RelockRule } from "./data/relock.ts";

const romWide: RelockRule = {
  romId: "test",
  scope: "rom",
  status: "supported",
  summary: "the project documents relocking",
  sourceUrl: "https://example.com/rom",
  verifiedAt: "2026-11-15",
};

test("a ROM-wide statement covers every device", () => {
  const info = resolveRelock([romWide], "test", "google", "tokay");

  assert.equal(info?.scope, "rom");
  assert.equal(info?.status, "supported");
  assert.equal(info?.sourceUrl, "https://example.com/rom");
});

test("a device statement beats the ROM-wide one", () => {
  const info = resolveRelock(
    [
      romWide,
      {
        ...romWide,
        scope: "device",
        vendor: "google",
        codename: "tokay",
        status: "unsupported",
        summary: "not lockable on this device",
        sourceUrl: "https://example.com/tokay",
      },
    ],
    "test",
    "google",
    "tokay",
  );

  assert.equal(info?.scope, "device");
  assert.equal(info?.status, "unsupported");
  assert.equal(info?.sourceUrl, "https://example.com/tokay");
});

test("a device statement does not leak to another device", () => {
  const info = resolveRelock(
    [
      romWide,
      {
        ...romWide,
        scope: "device",
        vendor: "google",
        codename: "tokay",
        status: "unsupported",
      },
    ],
    "test",
    "google",
    "caiman",
  );

  assert.equal(info?.scope, "rom");
  assert.equal(info?.status, "supported");
});

test("no statement leaves the pair unknown rather than unsupported", () => {
  assert.equal(resolveRelock([romWide], "other", "google", "tokay"), null);
});
