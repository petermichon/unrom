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

test("device pages mark a discontinued ROM", async ({ page }) => {
  await page.goto("/devices/asus/X00TD");

  const row = page.getByRole("row", { name: /ArrowOS/ });
  await expect(row.getByText("Discontinued", { exact: true })).toBeVisible();
});

test("registry-only devices are pages with no ROM data", async ({ page }) => {
  await page.goto("/devices/huawei/madrid");

  await expect(
    page.getByRole("heading", { name: "Huawei Y6 (2019)" }),
  ).toBeVisible();
  await expect(page.getByText("No custom ROM data yet")).toBeVisible();
  await expect(page.getByText("No ROM data yet")).toBeVisible();
});

test("device pages show the vendor bootloader policy", async ({ page }) => {
  await page.goto("/devices/fairphone/FP5");

  const policy = page.getByRole("region", { name: "Bootloader unlock" });
  await expect(policy).toBeVisible();
  await expect(policy.getByText("Supported", { exact: true })).toBeVisible();
  await expect(policy.getByText("All models", { exact: true })).toBeVisible();
  await expect(
    policy.getByRole("link", { name: "Official source" }),
  ).toHaveAttribute(
    "href",
    "https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader",
  );
});

test("bootloader policies cover Nothing", async ({ page }) => {
  await page.goto("/devices/nothing");

  const policy = page.getByRole("region", { name: "Bootloader unlock" });
  await expect(policy).toBeVisible();
  await expect(policy.getByText("Unknown", { exact: true })).toBeVisible();
  await expect(
    policy.getByRole("link", { name: "Official source" }),
  ).toHaveAttribute("href", "https://in.nothing.tech/pages/warranty-policy");
});

test("brand pages show the vendor bootloader policy", async ({ page }) => {
  await page.goto("/devices/xiaomi");

  const policy = page.getByRole("region", { name: "Bootloader unlock" });
  await expect(policy).toBeVisible();
  await expect(policy.getByText("Conditional", { exact: true })).toBeVisible();
  await expect(
    policy.getByText("Waiting periods and annual device quotas apply."),
  ).toBeVisible();
});
