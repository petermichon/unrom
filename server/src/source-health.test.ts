import assert from "node:assert/strict";
import { test } from "node:test";

import {
  auditHealth,
  updateHealth,
  type SourceHealthEntry,
} from "./ingest/health.ts";
import { sources } from "./ingest/sources.ts";

const NOW = new Date("2026-11-24T12:00:00.000Z");

function entry(
  overrides: Partial<SourceHealthEntry> & Pick<SourceHealthEntry, "file">,
): SourceHealthEntry {
  return {
    id: "rom",
    lastSuccessAt: "2026-11-24T03:00:00.000Z",
    lastError: null,
    ...overrides,
  };
}

test("a successful fetch records the time and clears the last error", () => {
  const [updated] = updateHealth(
    [entry({ file: "rom.json", lastError: "fetch failed" })],
    [{ id: "rom", file: "rom.json", ok: true }],
    NOW,
  );

  assert.equal(updated.lastSuccessAt, NOW.toISOString());
  assert.equal(updated.lastError, null);
});

test("a failed fetch keeps the last success and records the error", () => {
  const [updated] = updateHealth(
    [entry({ file: "rom.json", lastSuccessAt: "2026-11-20T03:00:00.000Z" })],
    [{ id: "rom", file: "rom.json", ok: false, error: "fetch failed" }],
    NOW,
  );

  assert.equal(updated.lastSuccessAt, "2026-11-20T03:00:00.000Z");
  assert.equal(updated.lastError, "fetch failed");
});

test("a source that was not run keeps its recorded health", () => {
  const kept = entry({ id: "other", file: "other.json" });
  const updated = updateHealth(
    [kept],
    [{ id: "rom", file: "rom.json", ok: true }],
    NOW,
  );

  assert.equal(updated.length, 2);
  assert.deepEqual(
    updated.find((item) => item.file === "other.json"),
    kept,
  );
  assert.deepEqual(
    updated.find((item) => item.file === "rom.json"),
    entry({ id: "rom", file: "rom.json", lastSuccessAt: NOW.toISOString() }),
  );
});

test("health is sorted by file so the committed record is stable", () => {
  const updated = updateHealth(
    [entry({ id: "b", file: "b.json" }), entry({ id: "a", file: "a.json" })],
    [],
    NOW,
  );

  assert.deepEqual(
    updated.map((item) => item.file),
    ["a.json", "b.json"],
  );
});

test("the audit separates healthy sources from quiet ones", () => {
  const registry = [
    { id: "ok", file: "ok.json" },
    { id: "stale", file: "stale.json" },
    { id: "failed", file: "failed.json" },
    { id: "never", file: "never.json" },
  ];
  const { findings, orphans } = auditHealth(
    [
      entry({ id: "ok", file: "ok.json" }),
      entry({
        id: "stale",
        file: "stale.json",
        lastSuccessAt: "2026-11-16T12:00:00.000Z",
      }),
      entry({ id: "failed", file: "failed.json", lastError: "fetch failed" }),
      entry({ id: "gone", file: "gone.json" }),
    ],
    registry,
    NOW,
    7,
  );

  assert.deepEqual(
    findings.map((finding) => [finding.id, finding.state, finding.ageDays]),
    [
      ["ok", "ok", 0],
      ["stale", "stale", 8],
      ["failed", "failed", 0],
      ["never", "never", null],
    ],
  );
  assert.deepEqual(orphans, ["gone.json"]);
});

test("the age boundary is inclusive, and a failure outranks staleness", () => {
  const registry = [{ id: "edge", file: "edge.json" }];

  const [atLimit] = auditHealth(
    [
      entry({
        id: "edge",
        file: "edge.json",
        lastSuccessAt: "2026-11-17T12:00:00.000Z",
      }),
    ],
    registry,
    NOW,
    7,
  ).findings;
  assert.equal(atLimit.state, "ok");
  assert.equal(atLimit.ageDays, 7);

  const [both] = auditHealth(
    [
      entry({
        id: "edge",
        file: "edge.json",
        lastSuccessAt: "2026-11-01T12:00:00.000Z",
        lastError: "fetch failed",
      }),
    ],
    registry,
    NOW,
    7,
  ).findings;
  assert.equal(both.state, "failed");
});

test("every registered source has its own snapshot file", () => {
  const files = new Set<string>();
  for (const source of sources) {
    assert.ok(source.id.length > 0);
    assert.match(source.file, /^[a-z0-9.-]+$/);
    assert.ok(
      !files.has(source.file),
      `duplicate snapshot file: ${source.file}`,
    );
    files.add(source.file);
  }
});
