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

test("menu options use a pointer cursor", async ({ page }) => {
  await page.goto("/devices");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Confidence" }).click();

  const option = page.getByRole("option", {
    name: "Verified",
    exact: true,
  });
  await expect(option).toBeVisible();
  expect(await option.evaluate((el) => getComputedStyle(el).cursor)).toBe(
    "pointer",
  );
});
