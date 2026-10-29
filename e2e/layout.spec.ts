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
