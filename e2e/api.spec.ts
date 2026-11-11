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

test("sort=name overrides coverage-first on directory pages", async ({
  request,
}) => {
  type Device = { name: string | null; codename: string };
  const response = await request.get("/api/devices?vendor=amazon&all=true");
  const devices = (await response.json()) as Device[];
  const key = (device: Device) =>
    (device.name ?? device.codename).toLowerCase();
  const expected = [...devices].sort((a, b) =>
    key(a) < key(b)
      ? -1
      : key(a) > key(b)
        ? 1
        : a.codename.localeCompare(b.codename),
  )[0];

  const first = (
    (await (
      await request.get("/api/devices?vendor=amazon&sort=name&limit=1")
    ).json()) as Device[]
  )[0];
  expect(first.codename).toBe(expected.codename);
});

test("sort=roms orders devices by ROM count", async ({ request }) => {
  type Device = { roms: unknown[] };
  const devices = (await (
    await request.get("/api/devices?sort=roms&limit=10")
  ).json()) as Device[];
  const counts = devices.map((device) => device.roms.length);
  expect(counts).toEqual([...counts].sort((a, b) => b - a));
});
