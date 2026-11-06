import { expect, test } from "@playwright/test";

// Registry data now lives on the device page instead of its own destination.
test("device identity shows curation provenance", async ({ page }) => {
  await page.goto("/devices/xiaomi/sweet");

  await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();
  await expect(page.getByText("Verified", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "lineageos" })).toHaveAttribute(
    "href",
    "/roms/lineageos",
  );
});

test("registry-only devices are pages with no ROM data", async ({ page }) => {
  await page.goto("/devices/huawei/madrid");

  await expect(
    page.getByRole("heading", { name: "Huawei Y6 (2019)" }),
  ).toBeVisible();
  await expect(page.getByText("No custom ROM data yet")).toBeVisible();
  await expect(page.getByText("No ROM data yet")).toBeVisible();
});
