import assert from "node:assert/strict";
import { test } from "node:test";

import { sampleWindow, windowsFor } from "./build/sample.ts";

const items = Array.from({ length: 250 }, (_, i) => i);

test("one window covers the whole list when the size exceeds it", () => {
  assert.deepEqual(sampleWindow(items, 500, 0), items);
  assert.equal(windowsFor(250, 500), 1);
});

test("rotations tile the list without gaps or overlaps", () => {
  const seen: number[] = [];
  for (let rotation = 0; rotation < windowsFor(250, 100); rotation++) {
    seen.push(...sampleWindow(items, 100, rotation));
  }
  assert.deepEqual(seen, items);
});

test("a rotation repeats its window instead of drifting", () => {
  assert.deepEqual(sampleWindow(items, 100, 1), sampleWindow(items, 100, 4));
  assert.deepEqual(sampleWindow(items, 100, 0), sampleWindow(items, 100, -3));
});

test("a short final window keeps only what exists", () => {
  const last = sampleWindow(items, 100, 2);
  assert.deepEqual(last, items.slice(200));
});

test("an empty list or a zero size samples nothing", () => {
  assert.deepEqual(sampleWindow([], 10, 0), []);
  assert.deepEqual(sampleWindow(items, 0, 0), []);
  assert.equal(windowsFor(0, 10), 0);
  assert.equal(windowsFor(10, 0), 0);
});
