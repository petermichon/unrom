import { expect, test } from "@playwright/test";

// Table state lives in memory; the URL is only a snapshot for page loads. Paging
// is therefore not a navigation and must not reset the scroll position.
test("paging the data table does not reset scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 500 });
  await page.goto("/data");

  const next = page.getByRole("button", { name: "Go to next page" });
  await next.scrollIntoViewIfNeeded();

  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);

  await next.click();

  await expect(page).toHaveURL(/\?page=2$/);
  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

// The URL snapshot is what makes a refresh or a shared link reproduce the view.
test("the URL snapshot restores the table on reload", async ({ page }) => {
  await page.goto("/data");
  await page.getByRole("button", { name: "Go to next page" }).click();
  await expect(page).toHaveURL(/\?page=2$/);

  await page.reload();

  await expect(page.getByText(/Page 2 of \d+/)).toBeVisible();
});
