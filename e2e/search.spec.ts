import { expect, test } from "@playwright/test";
import { proxyApi } from "./api-proxy.ts";

// Home and the command palette call the search API; forward it to the server.
test.beforeEach(async ({ page }) => {
  await proxyApi(page);
});

test("home search shows matching devices while typing", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device, codename, brand, or ROM…")
    .fill("poco");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test("home search also matches ROMs", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device, codename, brand, or ROM…")
    .fill("lineage");
  await expect(
    page.getByRole("option", { name: /lineageos/i }).first(),
  ).toBeVisible();
});

test("home search matches a device by a variant codename", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device, codename, brand, or ROM…")
    .fill("sweetin");
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

test("home search says nothing was found for a bad query", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device, codename, brand, or ROM…")
    .fill("zzzzzzzz");
  await expect(page.getByText(/No matches for/)).toBeVisible();
});

test("home search finds a catalogue-only ROM", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device, codename, brand, or ROM…")
    .fill("aokp");

  const rom = page.getByRole("option", { name: /AOKP/ }).first();
  await expect(rom).toBeVisible();
  await expect(rom).toContainText("No device data");
});

test("home links to the three directories", async ({ page }) => {
  await page.goto("/");

  const browse = page.locator("section[aria-labelledby='example-device']");
  for (const [label, href] of [
    ["All devices", "/devices"],
    ["All brands", "/brands"],
    ["All ROMs", "/roms"],
  ]) {
    const link = browse.getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", href);
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

test("home search shows matching brands", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device, codename, brand, or ROM…")
    .fill("samsung");
  const brand = page.getByRole("option", { name: /^Samsung/ }).first();
  await expect(brand).toBeVisible();
  await brand.click();
  await page.waitForURL("**/devices/samsung");
});

test("clicking an example fills the search", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search for sweet" }).click();
  await expect(
    page.getByPlaceholder("Search by device, codename, brand, or ROM…"),
  ).toHaveValue("sweet");
  await expect(
    page.getByRole("option", { name: /Redmi Note 10 Pro/ }).first(),
  ).toBeVisible();
});

test("example chips show when idle or when nothing matches", async ({
  page,
}) => {
  await page.goto("/");
  const example = page.getByRole("button", { name: "Search for Pixel" });
  const input = page.getByPlaceholder(
    "Search by device, codename, brand, or ROM…",
  );

  await expect(example).toBeVisible();

  await input.fill("pixel");
  await expect(example).toBeHidden();

  await input.fill("zzzzzz");
  await expect(page.getByText(/No matches for/)).toBeVisible();
  await expect(example).toBeVisible();
});

test("command palette shows matches while typing", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const input = page.getByPlaceholder("Search devices, brands, and ROMs…");
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(input).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  await input.fill("poco");
  await expect(page.getByRole("option").first()).toBeVisible();
});
