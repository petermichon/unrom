import assert from "node:assert/strict";
import { test } from "node:test";

import { classify } from "./build/probe.ts";

test("404 and 410 are the only gone answers", () => {
  assert.equal(classify({ status: 404, error: null }), "dead");
  assert.equal(classify({ status: 410, error: null }), "dead");
});

test("a redirect or success is reached", () => {
  assert.equal(classify({ status: 200, error: null }), "ok");
  assert.equal(classify({ status: 204, error: null }), "ok");
  assert.equal(classify({ status: 301, error: null }), "ok");
});

test("a bot wall, a rate limit or a timeout is unknown, not dead", () => {
  assert.equal(classify({ status: 403, error: null }), "unknown");
  assert.equal(classify({ status: 429, error: null }), "unknown");
  assert.equal(classify({ status: 503, error: null }), "unknown");
  assert.equal(classify({ status: null, error: "timeout" }), "unknown");
});
