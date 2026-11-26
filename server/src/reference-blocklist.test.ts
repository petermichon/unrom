import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { isBlockedHost, readBlockedHosts } from "./data/reference-blocklist.ts";

function withFile(contents: string | null, run: (path: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "unrom-blocklist-"));
  const path = join(dir, "reference-blocklist.json");
  try {
    if (contents !== null) writeFileSync(path, contents);
    run(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("an absent blocklist blocks nothing", () => {
  withFile(null, (path) => {
    assert.deepEqual(readBlockedHosts(path), []);
  });
});

test("a curated host keeps its date and reason", () => {
  withFile(
    JSON.stringify({
      hosts: [
        {
          host: "axpos.example",
          added: "2026-11-26",
          reason: "domain does not resolve",
        },
      ],
    }),
    (path) => {
      assert.deepEqual(readBlockedHosts(path), [
        {
          host: "axpos.example",
          added: "2026-11-26",
          reason: "domain does not resolve",
        },
      ]);
    },
  );
});

test("a malformed entry is an error, not a silent skip", () => {
  for (const hosts of [
    [{ host: "https://axpos.example/", added: "2026-11-26", reason: "x" }],
    [{ host: "AXPOS.example", added: "2026-11-26", reason: "x" }],
    [{ host: "axpos.example", added: "2026-11-26" }],
    [{ host: "axpos.example", reason: "x" }],
    ["axpos.example"],
  ]) {
    withFile(JSON.stringify({ hosts }), (path) => {
      assert.throws(() => readBlockedHosts(path), /reference-blocklist/);
    });
  }
});

test("a blocked host covers its subdomains but not similar names", () => {
  const blocked = [{ host: "axpos.example", added: "2026-11-26", reason: "x" }];
  assert.equal(isBlockedHost("axpos.example", blocked), true);
  assert.equal(isBlockedHost("www.axpos.example", blocked), true);
  assert.equal(isBlockedHost("notaxpos.example", blocked), false);
});
