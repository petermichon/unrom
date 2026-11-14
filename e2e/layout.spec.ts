import { expect, test } from "@playwright/test";

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

test("opening a menu does not lock page scroll", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle theme" }).click();

  await expect(
    page.getByRole("menuitemradio", { name: "Light" }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflowY,
    ),
  ).not.toBe("hidden");
});

test("menu options use a pointer cursor", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Toggle theme" }).click();

  const option = page.getByRole("menuitemradio", { name: "Light" });
  await expect(option).toBeVisible();
  expect(await option.evaluate((el) => getComputedStyle(el).cursor)).toBe(
    "pointer",
  );
});
