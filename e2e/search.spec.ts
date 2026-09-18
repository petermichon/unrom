import { expect, test } from "@playwright/test";

test("home search shows matching devices while typing", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device name, codename, vendor, or ROM…")
    .fill("poco");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test("home search also matches ROMs", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device name, codename, vendor, or ROM…")
    .fill("lineage");
  await expect(
    page.getByRole("option", { name: /lineageos/i }).first(),
  ).toBeVisible();
});

test("home search says nothing was found for a bad query", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device name, codename, vendor, or ROM…")
    .fill("zzzzzzzz");
  await expect(page.getByText("No matches found.")).toBeVisible();
});

test("home search shows matching vendors", async ({ page }) => {
  await page.goto("/");
  await page
    .getByPlaceholder("Search by device name, codename, vendor, or ROM…")
    .fill("samsung");
  const vendor = page.getByRole("option", { name: /^Samsung/ }).first();
  await expect(vendor).toBeVisible();
  await vendor.click();
  await page.waitForURL("**/devices/samsung");
});

test("clicking an example fills the search", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search for vayu" }).click();
  await expect(
    page.getByPlaceholder("Search by device name, codename, vendor, or ROM…"),
  ).toHaveValue("vayu");
  await expect(
    page.getByRole("option", { name: /POCO X3 Pro/ }).first(),
  ).toBeVisible();
});

test("command palette shows matches while typing", async ({ page }) => {
  // The palette's search index is fetched client-side from /api; in production
  // Caddy and in dev Vite proxy it, but this harness does not, so proxy here.
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    const response = await route.fetch({ url: url.toString() });
    await route.fulfill({ response });
  });

  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page
    .getByPlaceholder("Search devices, vendors, and ROMs…")
    .fill("poco");
  await expect(page.getByRole("option").first()).toBeVisible();
});
