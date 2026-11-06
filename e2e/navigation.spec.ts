import { expect, test } from "@playwright/test";

// The dataset is immutable per deployment, so client-side navigations must be
// served from the in-memory cache: once a route has been visited, going back to
// it must not trigger a loader `.data` request or an `/api/*` fetch.
test("repeat client navigations do not hit the network", async ({ page }) => {
  // The harness does not proxy /api; forward client fetches to the API server.
  await page.route("http://127.0.0.1:3001/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    const response = await route.fetch({ url: url.toString() });
    await route.fulfill({ response });
  });

  const network: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes(".data") || url.startsWith("http://127.0.0.1:3001/api/")) {
      network.push(url);
    }
  });

  const paths = ["/devices", "/roms", "/"];
  const link = (path: string) => page.locator(`a[href="${path}"]`).first();

  await page.goto("/");

  // Warm the cache for every top-level route with real client navigations.
  for (const path of paths) {
    await link(path).click();
    await page.waitForURL(`**${path}`);
  }

  // Any further navigation should be served entirely from memory.
  network.length = 0;
  for (const path of paths) {
    await link(path).click();
    await page.waitForURL(`**${path}`);
  }

  expect(network).toEqual([]);
});

test("client navigation renders the destination table", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    const response = await route.fetch({ url: url.toString() });
    await route.fulfill({ response });
  });

  await page.goto("/");
  await page.getByRole("link", { name: "ROMs" }).click();
  await expect(page.getByRole("heading", { name: "ROMs" })).toBeVisible();
  await expect(page.getByRole("link", { name: "LineageOS" })).toBeVisible();
});

test("the ROMs index separates covered from catalogue", async ({ page }) => {
  await page.goto("/roms");

  await expect(
    page.getByRole("heading", { name: "With device data" }),
  ).toBeVisible();
  await expect(page.getByText(/Catalogue only/)).toBeVisible();
  await expect(page.getByRole("link", { name: "LineageOS" })).toBeVisible();
});

test("the ROMs filter opens the catalogue for a match", async ({ page }) => {
  await page.goto("/roms");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Filter ROMs").fill("AlphaDroid");

  await expect(page.getByRole("link", { name: "AlphaDroid" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("1 of 260 ROMs");
});

test("the brands index links to a brand", async ({ page }) => {
  await page.goto("/brands");

  await expect(page.getByRole("heading", { name: "Brands" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Xiaomi/ })).toHaveAttribute(
    "href",
    "/devices/xiaomi",
  );
});

test("the brands filter narrows the list", async ({ page }) => {
  await page.goto("/brands");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Filter brands").fill("sams");

  await expect(page.getByRole("link", { name: /Samsung/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Xiaomi/ })).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("1 of 66 brands");
});

test("the mobile menu exposes navigation", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    const response = await route.fetch({ url: url.toString() });
    await route.fulfill({ response });
  });

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");

  const menu = page.getByRole("button", { name: "Open menu" });
  await expect(menu).toBeVisible();
  await menu.click();

  await page.getByRole("menuitem", { name: "Devices" }).click();
  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
});
