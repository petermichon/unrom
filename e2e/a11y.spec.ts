import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// WCAG success criteria only; axe's "best-practice" heuristics (e.g. landmark
// region rules around the third-party sidebar) are not failures.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function analyze(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

const PATHS = [
  "/",
  "/devices",
  "/devices/xiaomi",
  "/roms",
  "/data",
  "/devices/lenovo/A6020",
  "/roms/pixelos",
];

for (const path of PATHS) {
  test(`no accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await analyze(page);
    expect(violations).toEqual([]);
  });
}

test("404 page has no accessibility violations", async ({ page }) => {
  const response = await page.goto("/does-not-exist");
  expect(response?.status()).toBe(404);
  const { violations } = await analyze(page);
  expect(violations).toEqual([]);
});
