import { expect, test } from "@playwright/test";

// Tables render every row on the first document and paginate client-side. Any
// difference between the server and hydration render surfaces as a page error.
test("table pages hydrate without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const path of ["/devices/xiaomi/sweet", "/roms", "/roms/lineageos"]) {
    await page.goto(path);
    await page.waitForTimeout(400);
  }

  expect(errors).toEqual([]);
});
