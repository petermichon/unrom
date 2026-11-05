import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { sources } from "./sources/registry.ts";

const markdown = readFileSync(
  new URL("../../ROM_COVERAGE.md", import.meta.url),
  "utf8",
);

// Coverage names follow upstream lists; our rom names follow the ROM itself.
// Comparing case- and punctuation-insensitively keeps the check about presence,
// not spelling.
const normalize = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

function marked(emoji: string): Set<string> {
  const prefix = `- ${emoji} `;

  return new Set(
    markdown
      .split("\n")
      .filter((line) => line.startsWith(prefix))
      .map((line) => normalize(line.slice(prefix.length))),
  );
}

test("every implemented ROM is marked implemented in ROM_COVERAGE.md", () => {
  const implemented = marked("🟢");
  const missing = sources
    .map((source) => source.romName)
    .filter((name) => !implemented.has(normalize(name)));

  assert.deepEqual(missing, [], "mark these 🟢 in ROM_COVERAGE.md");
});

test("ROM_COVERAGE.md marks nothing implemented that has no source", () => {
  const implemented = new Set(sources.map((s) => normalize(s.romName)));
  const stale = [...marked("🟢")].filter((name) => !implemented.has(name));

  assert.deepEqual(stale, [], "remove the 🟢 mark: no source implements these");
});
