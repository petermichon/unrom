import { expect, test } from "@playwright/test";

const PAGES = [
  "/",
  "/data",
  "/legal",
  "/brands",
  "/devices",
  "/devices?vendor=xiaomi",
  "/roms",
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

test("data page exposes downloads and API", async ({ page }) => {
  await page.goto("/data");
  await expect(page.getByRole("heading", { name: "Downloads" })).toBeVisible();
  await expect(
    page.locator('a[href="/api/export/json"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/api/export/sqlite"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/api/openapi.json"]').first(),
  ).toBeVisible();
});

test("legal page names the publisher and host", async ({ page }) => {
  await page.goto("/legal");
  await expect(page.getByRole("heading", { name: "Publisher" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Host" })).toBeVisible();
  await expect(page.getByText("OVH SAS")).toBeVisible();
});

test("device metadata brands the model without duplicating it", async ({
  page,
}) => {
  await page.goto("/devices/samsung/a52sxq");
  await expect(page).toHaveTitle(
    "Samsung Galaxy A52s 5G (a52sxq) custom ROMs | unrom",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /^The Samsung Galaxy A52s 5G \(a52sxq\) is supported by \d+ custom ROMs/,
  );

  await page.goto("/devices/xiaomi/fuxi");
  await expect(page).toHaveTitle("Xiaomi 13 (fuxi) custom ROMs | unrom");
  const description = await page
    .locator('meta[name="description"]')
    .getAttribute("content");
  expect(description).toContain("The Xiaomi 13 (fuxi) is supported by");
  expect(description).not.toContain("by Xiaomi");
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

test("sitemap index points at each section sitemap", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");

  const xml = await response.text();
  expect(xml).toContain("<sitemapindex");
  for (const section of ["pages", "devices", "brands", "roms"]) {
    expect(xml).toContain(
      `<loc>https://unrom.com/sitemap-${section}.xml</loc>`,
    );
  }
  expect(xml).toContain("<lastmod>");
  expect(xml).not.toContain("<url>");
});

test("section sitemaps list only canonical, indexable pages", async ({
  request,
}) => {
  const pages = await request.get("/sitemap-pages.xml");
  const devices = await request.get("/sitemap-devices.xml");
  const brands = await request.get("/sitemap-brands.xml");
  const roms = await request.get("/sitemap-roms.xml");
  for (const response of [pages, devices, brands, roms]) {
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/xml");
  }

  const pageXml = await pages.text();
  expect(pageXml).toContain("<loc>https://unrom.com/</loc>");
  expect(pageXml).toContain("<loc>https://unrom.com/data</loc>");
  expect(pageXml).toContain("<loc>https://unrom.com/legal</loc>");
  expect(pageXml).toContain("<loc>https://unrom.com/brands</loc>");
  expect(pageXml).toContain("<loc>https://unrom.com/devices</loc>");
  expect(pageXml).not.toContain("<loc>https://unrom.com/devices?letter=");
  expect(pageXml).not.toContain("<loc>https://unrom.com/registry</loc>");

  const deviceXml = await devices.text();
  expect(deviceXml).toContain(
    "<loc>https://unrom.com/devices/xiaomi/sweet</loc>",
  );
  expect(deviceXml).not.toContain(
    "<loc>https://unrom.com/devices/huawei/madrid</loc>",
  );

  const brandXml = await brands.text();
  expect(brandXml).toContain("<loc>https://unrom.com/devices/xiaomi</loc>");

  const romXml = await roms.text();
  expect(romXml).toContain("<loc>https://unrom.com/roms/lineageos</loc>");
  expect(romXml).toContain("<loc>https://unrom.com/roms/alphadroid</loc>");
  expect(romXml).not.toContain("<loc>https://unrom.com/roms/aokp</loc>");
});

test("index titles name the search intent", async ({ page }) => {
  await page.goto("/devices");
  await expect(page).toHaveTitle("Android devices and ROM support | unrom");

  await page.goto("/brands");
  await expect(page).toHaveTitle("Android brands and ROM coverage | unrom");

  await page.goto("/roms");
  await expect(page).toHaveTitle(
    "Custom Android ROMs and supported devices | unrom",
  );
});

test("ROM and brand titles name the search intent", async ({ page }) => {
  await page.goto("/roms/lineageos");
  await expect(page).toHaveTitle("LineageOS supported devices | unrom");

  await page.goto("/devices/samsung");
  await expect(page).toHaveTitle("Samsung custom ROM devices | unrom");

  await page.goto("/roms/alphadroid");
  await expect(page).toHaveTitle("AlphaDroid supported devices | unrom");

  await page.goto("/roms/aokp");
  await expect(page).toHaveTitle("AOKP | unrom");
});

test("brand aliases redirect to the canonical lowercase URL", async ({
  request,
}) => {
  const response = await request.get("/devices/Lenovo", {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(301);
  expect(response.headers()["location"]).toBe("/devices/lenovo");
});

test("pagination pages are not indexable", async ({ page }) => {
  await page.goto("/devices");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);

  await page.goto("/devices?page=2");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("directory pages with a single ROM device are not indexable", async ({
  page,
  request,
}) => {
  const brands = (await (
    await request.get("http://127.0.0.1:3000/api/brands")
  ).json()) as Array<{ vendor: string; withRoms: number }>;
  const brand = brands.find((candidate) => candidate.withRoms === 1);

  if (brand) {
    await page.goto(`/devices/${brand.vendor}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
    const sitemap = await (await request.get("/sitemap-brands.xml")).text();
    expect(sitemap).not.toContain(
      `<loc>https://unrom.com/devices/${brand.vendor}</loc>`,
    );
  }

  if (brand) {
    // The brand-filtered directory duplicates the indexable brand page.
    await page.goto(`/devices?vendor=${brand.vendor}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex",
    );
  }
});

test("zero-ROM device pages are not indexable", async ({ page }) => {
  const response = await page.goto("/devices/huawei/madrid");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("zero-device ROM pages are not indexable", async ({ page }) => {
  const response = await page.goto("/roms/aokp");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
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
