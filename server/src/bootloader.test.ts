import assert from "node:assert/strict";
import { test } from "node:test";

import {
  BOOTLOADER_POLICIES,
  getBootloaderPolicy,
  listBootloaderPolicies,
} from "./data/bootloader.ts";

const STATUSES = new Set([
  "supported",
  "conditional",
  "unsupported",
  "unknown",
]);
const SCOPES = new Set(["all", "most", "some", "unknown"]);

test("bootloader policies carry complete provenance", () => {
  assert.ok(BOOTLOADER_POLICIES.length > 0);

  const vendors = new Set<string>();
  for (const policy of BOOTLOADER_POLICIES) {
    assert.match(policy.vendor, /^[a-z0-9-]+$/, policy.vendor);
    assert.ok(policy.vendorName.length > 0, policy.vendor);
    assert.ok(
      !vendors.has(policy.vendor),
      `duplicate vendor: ${policy.vendor}`,
    );
    vendors.add(policy.vendor);

    assert.ok(STATUSES.has(policy.status), policy.vendor);
    assert.ok(SCOPES.has(policy.scope), policy.vendor);
    assert.ok(policy.summary.length > 20, policy.vendor);

    const source = new URL(policy.sourceUrl);
    assert.equal(source.protocol, "https:", policy.vendor);

    assert.match(policy.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, policy.vendor);
    assert.ok(!Number.isNaN(Date.parse(policy.verifiedAt)), policy.vendor);

    if (policy.status === "conditional") {
      assert.ok(policy.conditions.length > 0, policy.vendor);
    }
  }
});

test("bootloader policy lookup is case-insensitive", () => {
  assert.equal(getBootloaderPolicy("Fairphone")?.vendor, "fairphone");
  assert.equal(getBootloaderPolicy("motorola")?.vendor, "motorola");
  assert.equal(getBootloaderPolicy("no-such-vendor"), null);
});

test("bootloader policy list is sorted by display name", () => {
  const names = listBootloaderPolicies().map((policy) => policy.vendorName);
  assert.deepEqual(
    names,
    [...names].sort((a, b) => a.localeCompare(b)),
  );
});
