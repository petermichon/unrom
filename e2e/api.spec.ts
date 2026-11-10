import { expect, test } from "@playwright/test";

// The dataset is immutable per deployment, so every reader endpoint should be
// cacheable and revalidate with the same validators.
const CACHED_PATHS = [
  "/api/meta",
  "/api/summary",
  "/api/brands",
  "/api/search?q=pixel",
  "/api/devices?limit=1",
  "/api/roms/summary",
];

test("dataset endpoints carry cache validators", async ({ request }) => {
  for (const path of CACHED_PATHS) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(response.headers()["cache-control"], path).toContain("public");
    expect(response.headers()["etag"], path).toBeTruthy();
    expect(response.headers()["last-modified"], path).toBeTruthy();
  }
});

test("device lists expose their total to browsers", async ({ request }) => {
  const response = await request.get("/api/devices?limit=1");

  expect(response.headers()["x-total-count"]).toBeTruthy();
  expect(
    response.headers()["access-control-expose-headers"]?.toLowerCase(),
  ).toContain("x-total-count");
});
