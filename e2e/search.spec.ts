import { expect, test, type Page } from "@playwright/test";
import { proxyApi } from "./api-proxy.ts";

// The search dialog calls the search API; forward it to the server.
test.beforeEach(async ({ page }) => {
  await proxyApi(page);
});

const HERO_SEARCH = { name: "Search devices, brands, and ROMs", exact: true };

/** The hero is a link into the one search surface; open it, return its field. */
async function openSearch(page: Page) {
  await page.goto("/");
  await page.getByRole("link", HERO_SEARCH).click();
  const field = page.getByPlaceholder("Devices, brands, ROMs");
  await expect(field).toBeVisible();
  return field;
}

test("the hero search shows matching devices while typing", async ({
  page,
}) => {
  const field = await openSearch(page);
  await field.fill("poco");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test("the hero search also matches ROMs", async ({ page }) => {
  const field = await openSearch(page);
  await field.fill("lineage");
  await expect(
    page.getByRole("option", { name: /lineageos/i }).first(),
  ).toBeVisible();
});

test("the hero search matches a device by a variant codename", async ({
  page,
}) => {
  const field = await openSearch(page);
  await field.fill("sweetin");
  await expect(
    page.getByRole("option", { name: /Redmi Note 10 Pro/ }).first(),
  ).toBeVisible();
});

test("a group member page lists the shared build coverage", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/sweetin");
  await expect(page.getByText("sweet, sweetin", { exact: true })).toBeVisible();
});

test("a renamed codename redirects to the canonical device", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/sirius");
  await page.waitForURL("**/devices/xiaomi/xmsirius");
  await expect(page.getByText("sirius", { exact: true })).toBeVisible();
});

test("the hero search says nothing was found for a bad query", async ({
  page,
}) => {
  const field = await openSearch(page);
  await field.fill("zzzzzzzz");
  await expect(page.getByText("No results found.")).toBeVisible();
});

test("the hero search finds a catalogue-only ROM", async ({ page }) => {
  const field = await openSearch(page);
  await field.fill("aokp");

  const rom = page.getByRole("option", { name: /AOKP/ }).first();
  await expect(rom).toBeVisible();
  await expect(rom).toContainText("No device data");
});

test("home links to the three directories", async ({ page }) => {
  await page.goto("/");

  const links = [
    [/All [\d,]+ brands/, "/brands"],
    [/All [\d,]+ ROMs/, "/roms"],
    ["All devices", "/devices"],
  ] as const;
  for (const [name, href] of links) {
    await expect(
      page.locator("main").getByRole("link", { name }),
    ).toHaveAttribute("href", href);
  }
});

test("home leads with a real device mapping and its sources", async ({
  page,
}) => {
  await page.goto("/");

  const example = page.locator("section[aria-labelledby='example-device']");
  await expect(example).toBeVisible();
  await expect(
    example.getByRole("link", { name: /See all \d+ ROMs/ }),
  ).toBeVisible();
  await expect(example.locator('a[target="_blank"]').first()).toBeVisible();
});

test("the hero search shows matching brands", async ({ page }) => {
  const field = await openSearch(page);
  await field.fill("samsung");
  const brand = page.getByRole("option", { name: /^Samsung/ }).first();
  await expect(brand).toBeVisible();
  await brand.click();
  await page.waitForURL("**/devices/samsung");
});

test("the hero search offers the full result list", async ({ page }) => {
  const field = await openSearch(page);
  await field.fill("pixel");

  const all = page.getByRole("option", { name: /Every device matching/ });
  await expect(all).toBeVisible();
  await all.click();
  await page.waitForURL("**/devices?q=pixel");
});

test("an example opens the search dialog already searching", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Search for Redmi Note 10 Pro" })
    .click();

  const field = page
    .getByRole("dialog")
    .getByPlaceholder("Devices, brands, ROMs");
  await expect(field).toHaveValue("Redmi Note 10 Pro");
  await expect(
    page.getByRole("option", { name: /Redmi Note 10 Pro/ }).first(),
  ).toBeVisible();
});

test.describe("without scripts", () => {
  test.use({ javaScriptEnabled: false });

  test("the hero search falls back to the device directory", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", HERO_SEARCH).click();
    await page.waitForURL("**/devices");
  });
});

test("command palette shows matches while typing", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const input = page
    .getByRole("dialog")
    .getByPlaceholder("Devices, brands, ROMs");
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(input).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  await input.fill("poco");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test.describe("one search on a phone", () => {
  test.use({
    viewport: { width: 390, height: 664 },
    isMobile: true,
    hasTouch: true,
  });

  test("the hero opens the shared dialog as a card", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", HERO_SEARCH).tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // A rounded card over the page, not an edge-to-edge sheet.
    const box = await dialog.boundingBox();
    expect(box?.width ?? 0).toBeLessThan(390);
    expect(box?.y ?? 0).toBeGreaterThan(0);
    expect(
      await dialog.evaluate((el) => getComputedStyle(el).borderRadius),
    ).not.toBe("0px");

    const input = dialog.getByPlaceholder("Devices, brands, ROMs");
    await expect(input).toBeFocused();

    await page.keyboard.type("pixel");
    await expect(page.getByRole("option").first()).toBeVisible();

    // The page behind must not move.
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("both entry points open the same dialog in the same place", async ({
    page,
  }) => {
    await page.goto("/");

    const dialog = page.getByRole("dialog");
    await page.getByRole("link", HERO_SEARCH).tap();
    await expect(dialog).toBeVisible();
    const fromHero = await dialog.boundingBox();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    await page
      .getByRole("button", { name: "Search devices, brands, and ROMs" })
      .click();
    await expect(dialog).toBeVisible();
    const fromHeader = await dialog.boundingBox();

    expect(fromHeader).toEqual(fromHero);
  });

  test("a hero example opens the dialog already searching", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Search for Redmi Note 10 Pro" })
      .tap();

    const input = page
      .getByRole("dialog")
      .getByPlaceholder("Devices, brands, ROMs");
    await expect(input).toHaveValue("Redmi Note 10 Pro");
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("closing returns to the page where it was left", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.getByRole("link", HERO_SEARCH).tap();
    await page.keyboard.type("pixel");
    await expect(page.getByRole("option").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(200);
  });
});
