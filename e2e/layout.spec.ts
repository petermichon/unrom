import { expect, test } from "@playwright/test";

test("home search field is vertically centered in its frame", async ({
  page,
}) => {
  await page.goto("/");

  const frame = await page.locator("[data-slot=command]").first().boundingBox();
  const field = await page
    .locator("[data-slot=input-group]")
    .first()
    .boundingBox();

  expect(frame).not.toBeNull();
  expect(field).not.toBeNull();
  if (!frame || !field) return;

  const above = field.y - frame.y;
  const below = frame.y + frame.height - (field.y + field.height);
  expect(Math.abs(above - below)).toBeLessThanOrEqual(1);
});

test.describe("phone below the copy", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows the phone below the copy and steps it by hand", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.locator(".hero-panel");
    const phone = hero.locator('img[src="/brand/lineageos.png"]').first();
    const stats = await hero.locator("p.tabular-nums").boundingBox();
    const phoneBox = await phone.boundingBox();

    await expect(phone).toBeVisible();
    expect(stats).not.toBeNull();
    expect(phoneBox).not.toBeNull();
    if (!stats || !phoneBox) return;
    expect(phoneBox.y).toBeGreaterThan(stats.y);

    await hero.getByRole("button", { name: "Show GrapheneOS" }).click();

    await expect(
      hero.getByRole("button", { name: "Show GrapheneOS" }),
    ).toHaveAttribute("aria-current", "true");
    await expect(page.locator("html")).toHaveAttribute(
      "data-rom",
      "grapheneos",
    );
  });
});

test("menu options use a pointer cursor", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Export the dataset" }).click();

  const option = page.getByRole("menuitem", {
    name: "Download SQLite database",
  });
  await expect(option).toBeVisible();
  expect(await option.evaluate((el) => getComputedStyle(el).cursor)).toBe(
    "pointer",
  );
});
