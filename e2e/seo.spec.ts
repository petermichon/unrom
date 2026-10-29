import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/devices",
  "/roms",
  "/data",
  "/registry",
  "/roms/projectinfinityx",
  "/devices/samsung/a52sxq",
];

test("indexable pages expose complete metadata", async ({ page }) => {
  for (const path of PAGES) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);

    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute(
      "href",
      `https://unrom.com${path}`,
    );

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description?.length ?? 0, path).toBeGreaterThan(60);

    await expect(page.locator('meta[property="og:title"]'), path).toHaveCount(
      1,
    );
    await expect(page.locator('meta[property="og:image"]'), path).toHaveCount(
      1,
    );

    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(scripts.length, path).toBeGreaterThan(0);
    for (const script of scripts) {
      expect(
        () => JSON.parse(script),
        `${path}: invalid JSON-LD`,
      ).not.toThrow();
    }
  }
});

test("ROM pages put the whole device list and structured data in the HTML", async ({
  request,
}) => {
  const html = await (await request.get("/roms/projectinfinityx")).text();

  // Pagination is an enhancement: every row is server-rendered.
  expect((html.match(/<tr/g) ?? []).length).toBeGreaterThan(50);
  expect(html).toContain('"@type":"SoftwareApplication"');
  expect(html).toContain('"@type":"ItemList"');
  expect(html).toContain('"@type":"BreadcrumbList"');
});

test("HTML responses carry cache validators", async ({ request }) => {
  const response = await request.get("/roms/projectinfinityx");
  const headers = response.headers();
  expect(headers["cache-control"]).toContain("must-revalidate");
  expect(headers["etag"]).toBeTruthy();
  expect(headers["last-modified"]).toBeTruthy();
});

test("sitemap lists canonical pages with a trustworthy lastmod", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");

  const xml = await response.text();
  expect(xml).toContain("<loc>https://unrom.com/</loc>");
  expect(xml).toContain("<loc>https://unrom.com/registry</loc>");
  expect(xml).toContain("<lastmod>");
});

test("vendor aliases redirect to the canonical lowercase URL", async ({
  request,
}) => {
  const response = await request.get("/devices/Lenovo", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(301);
  expect(response.headers()["location"]).toBe("/devices/lenovo");
});

test("error pages are not indexable", async ({ page }) => {
  for (const path of [
    "/does-not-exist",
    "/roms/does-not-exist",
    "/devices/nope/nope",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.locator('meta[name="robots"]'), path).toHaveAttribute(
      "content",
      "noindex",
    );
  }
});
