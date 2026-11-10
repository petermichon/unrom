import { expect, test } from "@playwright/test";

// Registry data now lives on the device page instead of its own destination.
test("device identity shows curation provenance", async ({ page }) => {
  await page.goto("/devices/xiaomi/sweet");

  const identity = page.getByRole("region", { name: "Identity" });
  await expect(identity).toBeVisible();
  await expect(identity.getByText("Verified", { exact: true })).toBeVisible();
  await expect(
    identity.getByRole("link", { name: "LineageOS", exact: true }),
  ).toHaveAttribute("href", "/roms/lineageos");
});

test("registry-only devices are pages with no ROM data", async ({ page }) => {
  await page.goto("/devices/huawei/madrid");

  await expect(
    page.getByRole("heading", { name: "Huawei Y6 (2019)" }),
  ).toBeVisible();
  await expect(page.getByText("No custom ROM data yet")).toBeVisible();
  await expect(page.getByText("No ROM data yet")).toBeVisible();
});
