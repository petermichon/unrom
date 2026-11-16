import { expect, test } from "@playwright/test";
import { proxyApi } from "./api-proxy.ts";
import { WEB_URL } from "./env.ts";

// The dataset is immutable per deployment, so client-side navigations must be
// served from the in-memory cache: once a route has been visited, going back to
// it must not trigger a loader `.data` request or an `/api/*` fetch.
test("repeat client navigations do not hit the network", async ({ page }) => {
  // The harness does not proxy /api; forward client fetches to the API server.
  await proxyApi(page);

  const network: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes(".data") || url.startsWith(`${WEB_URL}/api/`)) {
      network.push(url);
    }
  });

  const paths = ["/devices", "/roms", "/"];
  const link = (path: string) =>
    page.locator(`a[href="${path}"]:visible`).first();

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
    .getByRole("link", { name: "Custom ROMs", exact: true })
    .click();
  await page.waitForURL("**/roms");
  await expect(
    page.getByRole("heading", { name: "Custom ROMs", level: 1, exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/roms/lineageos"]').first(),
  ).toBeVisible();
});

test("hovering a section opens the mega menu", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const devices = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Devices", exact: true });
  // Hydration may land after the first pointer move; retry the hover.
  await expect(async () => {
    await devices.hover();
    await expect(page.locator("#mega-menu")).toBeVisible({
      timeout: 1_000,
    });
  }).toPass({ timeout: 10_000 });
  await expect(devices).toHaveAttribute("aria-expanded", "true");
});

test("moving off the panel's sides closes the mega menu", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const menu = page.locator("#mega-menu");
  await expect(async () => {
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Devices", exact: true })
      .hover();
    await expect(menu).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  // Far left of the panel at the panel's own height: this used to be inside a
  // full-width hover wrapper, so the menu never closed sideways.
  await page.mouse.move(5, (box as { y: number }).y + 40);
  await expect(menu).toHaveCount(0);
});

test("the ROMs menu pins GrapheneOS in its own chip", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const menu = page.locator("#mega-menu");
  await expect(async () => {
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Custom ROMs", exact: true })
      .hover();
    await expect(menu).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  const featured = menu.getByRole("link", { name: /GrapheneOS/ });
  await expect(featured).toHaveAttribute("href", "/roms/grapheneos");
  await expect(menu.locator('[data-rom-glyph="grapheneos"]')).toBeVisible();

  // The shortcut list is curated, not sorted by device count.
  const hrefs = await menu
    .locator('a[href^="/roms/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(hrefs).toEqual([
    "/roms/grapheneos",
    "/roms/calyxos",
    "/roms/iode",
    "/roms/eos",
    "/roms/lineageos",
  ]);
});

test("each trigger opens its own panel", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const nav = page.getByRole("navigation", { name: "Main" });
  const menu = page.locator("#mega-menu");
  const show = async (name: string) => {
    await nav.getByRole("link", { name, exact: true }).hover();
    await expect(menu).toBeVisible();
  };

  await show("Devices");
  await expect(
    menu.getByRole("link", { name: /Relock supported/ }),
  ).toHaveAttribute("href", "/devices?relock=supported");
  await expect(menu.locator('a[href="/devices"]')).toBeVisible();

  await show("Brands");
  await expect(menu.getByRole("link", { name: /All brands/ })).toBeVisible();

  await show("Custom ROMs");
  await expect(menu.getByRole("link", { name: /GrapheneOS/ })).toBeVisible();
  await expect(menu.getByRole("link", { name: /All ROMs/ })).toBeVisible();

  // Data is a page, not a section, so it lives in the site footer: not in the
  // trigger row and not in the open panel.
  const triggers = nav.locator(":scope > div:not(#mega-menu)");
  await expect(triggers.locator('a[href="/data"]')).toHaveCount(0);
  await expect(menu.locator('a[href="/data"]')).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Project" })
      .getByRole("link", { name: "Data & API", exact: true }),
  ).toBeVisible();
});

test("the mega menu opens when the API is unreachable", async ({ page }) => {
  // The menu is curated navigation, not a data view. Every client-side API
  // call fails here, so shortcuts that waited on a fetch would disappear.
  await page.route("**/api/**", (route) => route.abort());

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const nav = page.getByRole("navigation", { name: "Main" });
  const menu = page.locator("#mega-menu");
  const show = async (name: string) => {
    await expect(async () => {
      await nav.getByRole("link", { name, exact: true }).hover();
      await expect(menu).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
  };

  await show("Devices");
  await expect(menu.getByRole("link", { name: /Hardened/ })).toBeVisible();

  await show("Brands");
  await expect(menu.getByRole("link", { name: /Google/ })).toBeVisible();

  await show("Custom ROMs");
  await expect(menu.getByRole("link", { name: /GrapheneOS/ })).toBeVisible();
  await expect(menu.getByRole("link", { name: /All ROMs/ })).toBeVisible();
});

test("mega menu opens from the keyboard and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");

  const devices = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Devices", exact: true });
  await devices.focus();
  await page.keyboard.press("ArrowDown");

  await expect(page.locator("#mega-menu")).toBeVisible();
  await expect(page.locator("#mega-menu")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.locator("#mega-menu")).toHaveCount(0);
  await expect(devices).toBeFocused();
});

test("the mega menu paints above page content", async ({ page }) => {
  await page.goto("/roms/lineageos");
  await page.waitForLoadState("networkidle");

  const devices = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Devices", exact: true });
  await expect(async () => {
    await devices.hover();
    await expect(page.locator("#mega-menu")).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  const box = await page.locator("#mega-menu").boundingBox();
  expect(box).not.toBeNull();
  // A point inside the panel that also sits over the page behind it: the
  // header is 64px tall, so the panel's top edge overlaps the first content.
  const top = await page.evaluate(
    (y) => {
      const element = document.elementFromPoint(500, y);
      return element?.closest("#mega-menu")
        ? "menu"
        : (element?.tagName ?? "none");
    },
    (box as { y: number }).y + 10,
  );
  expect(top).toBe("menu");
});

test("navigation closes the mega menu", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Custom ROMs", exact: true })
    .click();
  await page.waitForURL("**/roms");

  // Scroll restoration re-evaluates hover after the route settles; a
  // stationary pointer must not reopen the panel.
  await page.waitForTimeout(600);
  await expect(page.locator("#mega-menu")).toHaveCount(0);
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
    .getByRole("navigation", { name: "Project" })
    .getByRole("link", { name: "Data & API" })
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
    .getByRole("navigation", { name: "Project" })
    .getByRole("link", { name: "Data & API" })
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

test("the devices directory opens a brand page", async ({ page }) => {
  await page.goto("/devices");

  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();

  await page.getByRole("combobox", { name: "Brand" }).selectOption("xiaomi");
  await expect(page).toHaveURL(/\/devices\/xiaomi$/);
  await expect(
    page.getByRole("heading", { name: "Xiaomi", level: 1, exact: true }),
  ).toBeVisible();
  await expect(page.locator("a.device-row").first()).toBeVisible();
});

test("a ROM page themes the whole page", async ({ page }) => {
  const brandOn = (selector: string) =>
    page.locator(selector).evaluate((element) => {
      const raw = getComputedStyle(element).getPropertyValue("--brand").trim();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "#000";
      context.fillStyle = raw;
      context.fillRect(0, 0, 1, 1);
      return Array.from(context.getImageData(0, 0, 1, 1).data).join(",");
    });

  await page.goto("/devices");
  const plain = await brandOn("html");

  await page.goto("/roms/lineageos");
  await expect(page.locator("html")).toHaveAttribute("data-rom", "lineageos");
  const themed = await brandOn("main .rom-page");

  // The palette is derived, so compare the rendered colour, not the token.
  expect(themed).not.toBe(plain);
});

test("the LineageOS page shows the ROM mark and palette", async ({ page }) => {
  await page.goto("/roms/lineageos");

  const hero = page.locator("main .hero-panel");
  await expect(hero).toBeVisible();
  await expect(hero.locator('[data-rom-mark="lineageos"]')).toBeVisible();
});

test("the devices directory leads with the most-supported devices", async ({
  page,
}) => {
  await page.goto("/devices");

  const first = page.locator("main ul.index-frame > li").first();
  await expect(first).toContainText("POCO M2 Pro");
  await expect(first).toContainText("36 ROMs");
});

test("the directory shows only devices with ROM data", async ({ page }) => {
  await page.goto("/devices?roms=1");

  await expect(
    page.getByRole("link", { name: "With ROM data" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.locator("a.device-row").first()).toBeVisible();
  await expect(page.getByText(/^0 ROMs$/)).toHaveCount(0);
});

test("a brand page paginates its devices", async ({ page }) => {
  await page.goto("/devices/xiaomi");
  await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
  await expect(page.locator("a.device-row")).toHaveCount(200);

  await page.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/devices\/xiaomi\?page=2$/);
  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
  await expect(page.locator("a.device-row")).toHaveCount(200);
});

test("old letter URLs redirect to the directory", async ({ page }) => {
  await page.goto("/devices/letter/g");
  await page.waitForURL("**/devices");
  await expect(
    page.getByRole("heading", { name: "Devices", level: 1, exact: true }),
  ).toBeVisible();
});

test("old letter filters redirect to the directory", async ({ page }) => {
  await page.goto("/devices?letter=g");
  await page.waitForURL("**/devices");
});

test("uppercase brand filters redirect to lowercase", async ({ page }) => {
  await page.goto("/devices?vendor=Xiaomi");
  await page.waitForURL("**/devices/xiaomi");
  await expect(
    page.getByRole("heading", { name: "Xiaomi", level: 1, exact: true }),
  ).toBeVisible();
});

test("the ROMs index separates covered from catalogue", async ({ page }) => {
  await page.goto("/roms");

  await expect(
    page.getByRole("heading", { name: "With device data" }),
  ).toBeVisible();
  await expect(page.getByText(/Catalogue only/)).toBeVisible();
  await expect(
    page.locator('main a[href="/roms/lineageos"]').first(),
  ).toBeVisible();
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

test("the relock filter opens the documented devices", async ({ page }) => {
  await page.goto("/devices?relock=supported");
  await page.waitForLoadState("networkidle");

  const toggle = page.getByRole("link", { name: "Relock supported" });
  await expect(toggle).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("link", { name: /Pixel 9/ }).first(),
  ).toBeVisible();
  // A filtered view is not an indexable page of its own.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("the updated filter opens the recently built devices", async ({
  page,
}) => {
  await page.goto("/devices?updated=90");
  await page.waitForLoadState("networkidle");

  const toggle = page.getByRole("link", { name: "Recently updated" });
  await expect(toggle).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("status")).toHaveText(/\d[\d,]* devices/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("the hardened filter opens the documented devices", async ({ page }) => {
  await page.goto("/devices?hardened=1");
  await page.waitForLoadState("networkidle");

  const toggle = page.getByRole("link", { name: "Hardened", exact: true });
  await expect(toggle).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByRole("link", { name: /Pixel 9/ }).first(),
  ).toBeVisible();
  // The row says why it matched, with the pages that state each fact.
  await expect(page.getByText("GrapheneOS").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "patches", exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
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

test("the mobile menu is a sheet with the directory shortcuts", async ({
  page,
}) => {
  await proxyApi(page);

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");

  // The header is a single row on mobile, so the section links live in the
  // sheet rather than a second navigation row.
  await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Menu" });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('a[href="/devices"]')).toBeVisible();
  await expect(
    sheet.locator('a[href="/devices?relock=supported"]'),
  ).toBeVisible();
  await expect(sheet.locator('a[href="/roms/grapheneos"]')).toBeVisible();

  // Escape closes it and hands focus back to the trigger.
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();

  // A navigation from the sheet closes it too.
  await trigger.click();
  await sheet.locator('a[href="/brands"]').click();
  await expect(page).toHaveURL(/\/brands$/);
  await expect(sheet).toHaveCount(0);
});
