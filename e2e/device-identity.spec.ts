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

test("device pages say when every ROM is discontinued", async ({ page }) => {
  await page.goto("/devices/lenovo/jd2019");
  await expect(
    page.getByText(
      "Supported by 4 custom ROMs, all marked discontinued upstream.",
    ),
  ).toBeVisible();

  await page.goto("/devices/lenovo/jd2019p");
  await expect(
    page.getByText(
      "The only custom ROM listed is marked discontinued upstream.",
    ),
  ).toBeVisible();
});

test("device pages say when no bootloader policy is recorded", async ({
  page,
}) => {
  await page.goto("/devices/samsung/beyond2lte");

  const policy = page.getByRole("region", { name: "Bootloader unlock" });
  await expect(policy).toBeVisible();
  await expect(policy.getByText("Unknown", { exact: true })).toBeVisible();
  await expect(policy).toContainText(
    "No vendor policy on unlocking is recorded",
  );
  // Silence is not a "no": the card must not claim the bootloader is locked.
  await expect(policy).not.toContainText("Not supported");
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

test("device pages show the newest build's date and patch level", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/peridot");

  const row = page.getByRole("row").filter({
    has: page.getByRole("cell", { name: "LineageOS", exact: true }),
  });
  await expect(row).toContainText(/\d{1,2} [A-Z][a-z]{2} \d{4}/);
  await expect(row).toContainText(/patch [A-Z][a-z]{2} \d{4}/);
});

test("device pages say when a source publishes no build metadata", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/peridot");

  const row = page.getByRole("row").filter({
    has: page.getByRole("cell", { name: "Clover", exact: true }),
  });
  await expect(row.getByText("Not published", { exact: true })).toBeVisible();
});

test("the build column sorts newest first, with unknown dates last", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/peridot");

  const rows = page.locator("tbody tr");
  const sort = async (direction: "Sort ascending" | "Sort descending") => {
    await page.getByRole("button", { name: /^Build/ }).click();
    await page.getByRole("menuitem", { name: direction }).click();
  };

  await sort("Sort descending");
  await expect(rows.first()).toContainText(/\d{1,2} [A-Z][a-z]{2} \d{4}/);
  await expect(rows.last()).toContainText("Not published");

  // Unknown is not "old": it stays last when the order is flipped.
  await sort("Sort ascending");
  await expect(rows.last()).toContainText("Not published");
});

test("device pages name the ROMs that document relocking", async ({ page }) => {
  await page.goto("/devices/google/tokay");

  const policy = page.getByRole("region", { name: "Bootloader unlock" });
  await expect(policy.getByText(/Relock after a custom ROM/)).toBeVisible();
  await expect(
    policy.getByRole("link", { name: "GrapheneOS" }),
  ).toHaveAttribute("href", "/roms/grapheneos");
  await expect(policy.getByRole("link", { name: "CalyxOS" })).toHaveAttribute(
    "href",
    "/roms/calyxos",
  );
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
