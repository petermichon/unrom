import { expect, test } from "@playwright/test";
import { proxyApi } from "./api-proxy.ts";

// The dataset is immutable per deployment, so client-side navigations must be
// served from the in-memory cache: once a route has been visited, going back to
// it must not trigger a loader `.data` request or an `/api/*` fetch.
test("repeat client navigations do not hit the network", async ({ page }) => {
  // The harness does not proxy /api; forward client fetches to the API server.
  await proxyApi(page);

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
  await proxyApi(page);

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "ROMs" })
    .click();
  await page.waitForURL("**/roms");
  await expect(
    page.getByRole("heading", { name: "ROMs", level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href="/roms/lineageos"]')).toBeVisible();
});

test("client navigation survives a failing /api index", async ({ page }) => {
  await proxyApi(page);

  // The endpoint index is optional page chrome. Simulate a proxy that routes
  // bare /api to the web app instead of the API, as the old Caddyfile did, so
  // the client loader gets a 404 instead of the endpoint list.
  await page.route("**/api", (route) =>
    route.fulfill({
      status: 404,
      contentType: "text/plain",
      body: "Not Found",
    }),
  );

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Data access" })
    .getByRole("link", { name: "Data" })
    .click();
  await page.waitForURL("**/data");

  await expect(page.getByRole("heading", { name: "Downloads" })).toBeVisible();
  await expect(page.getByText(/endpoint list is unavailable/i)).toBeVisible();
});

// No proxyApi here: this exercises the standalone server's own /api proxy, so
// `npm start --workspace web` works without a reverse proxy in front.
test("the standalone server proxies /api for client navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Data access" })
    .getByRole("link", { name: "Data" })
    .click();
  await page.waitForURL("**/data");

  await expect(page.getByRole("heading", { name: "Downloads" })).toBeVisible();
  await expect(
    page.locator("code", { hasText: "/api/devices/letters" }),
  ).toBeVisible();
});

test("a brand page lists its devices", async ({ page }) => {
  await page.goto("/devices/xiaomi");

  await expect(page.getByRole("heading", { name: "Xiaomi" })).toBeVisible();
  await expect(page.locator("a.device-row").first()).toBeVisible();
});

test("the devices directory links to letter filters", async ({ page }) => {
  await page.goto("/devices");

  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[href="/devices?letter=a"]')).toBeVisible();
  await expect(page.locator('a[href="/devices?letter=g"]')).toBeVisible();
});

test("non-Latin names get their own directory filter", async ({ page }) => {
  await page.goto("/devices");

  await expect(page.locator('a[href="/devices?letter=other"]')).toBeVisible();

  await page.goto("/devices?letter=other");
  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.locator("a.device-row").first()).toBeVisible();
});

test("the directory filters by letter and ROM coverage", async ({ page }) => {
  await page.goto("/devices?letter=h");

  const letter = page.getByRole("link", { name: "H", exact: true });
  await expect(letter).toHaveAttribute("aria-current", "page");
  await expect(page.locator("a.device-row").first()).toBeVisible();

  await page.getByRole("link", { name: "With ROM data" }).click();
  await expect(page).toHaveURL(/(\?|&)roms=1/);
  await expect(page.getByText(/^\d[\d,]* devices$/)).toBeVisible();
  await expect(page.locator("a.device-row").first()).toBeVisible();
});

test("the devices directory paginates", async ({ page }) => {
  await page.goto("/devices?letter=g");
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  await expect(page.locator("a.device-row")).toHaveCount(200);

  await page.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/letter=g&page=2$/);
  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
  await expect(page.locator("a.device-row")).toHaveCount(200);
});

test("old letter URLs redirect into the directory filter", async ({ page }) => {
  await page.goto("/devices/letter/g");
  await page.waitForURL("**/devices?letter=g");
  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();
});

test("uppercase letter filters redirect to lowercase", async ({ page }) => {
  await page.goto("/devices?letter=X");
  await page.waitForURL("**/devices?letter=x");
  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();
});

test("the ROMs index separates covered from catalogue", async ({ page }) => {
  await page.goto("/roms");

  await expect(
    page.getByRole("heading", { name: "With device data" }),
  ).toBeVisible();
  await expect(page.getByText(/Catalogue only/)).toBeVisible();
  await expect(page.locator('a[href="/roms/lineageos"]')).toBeVisible();
});

test("the ROMs filter opens the catalogue for a match", async ({ page }) => {
  await page.goto("/roms");
  await page.waitForLoadState("networkidle");
  await expect(async () => {
    await page.getByLabel("Filter ROMs").fill("AlphaDroid");
    await expect(page.getByRole("status")).toHaveText(/1 of [\d,]+ ROMs/, {
      timeout: 1_500,
    });
  }).toPass({ timeout: 10_000 });

  await expect(page.getByRole("link", { name: "AlphaDroid" })).toBeVisible();
});

test("the brands index links to a brand", async ({ page }) => {
  await page.goto("/brands");

  await expect(
    page.getByRole("heading", { name: "Brands", level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Xiaomi/ })).toHaveAttribute(
    "href",
    "/devices/xiaomi",
  );
  await expect(page.getByRole("link", { name: /Xiaomi/ })).toContainText(
    "ROMs",
  );
});

test("the brands filter narrows the list", async ({ page }) => {
  await page.goto("/brands");
  await page.waitForLoadState("networkidle");
  await expect(async () => {
    await page.getByLabel("Filter brands").fill("sams");
    await expect(page.getByRole("status")).toHaveText(/1 of [\d,]+ brands/, {
      timeout: 1_500,
    });
  }).toPass({ timeout: 10_000 });

  await expect(page.getByRole("link", { name: /Samsung/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Xiaomi/ })).toHaveCount(0);
});

test("mobile shows sections in the utility menu", async ({ page }) => {
  await proxyApi(page);

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");

  // The header is a single row on mobile, so the section links live in the
  // menu rather than a second navigation row.
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

  const menu = page.getByRole("button", { name: "Open menu" });
  await menu.click();
  await expect(
    page.getByRole("menuitem", { name: "Dataset overview" }),
  ).toBeVisible();

  const devices = page.getByRole("menuitem", { name: "Devices" });
  await expect(devices).toBeVisible();
  await devices.click();
  await expect(page).toHaveURL(/\/devices$/);
  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();
});
