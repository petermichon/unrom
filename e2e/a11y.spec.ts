import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// The full devices directory (900+ rows) takes axe well past the default.
test.describe.configure({ timeout: 90_000 });

// WCAG success criteria only; axe's "best-practice" heuristics (e.g. landmark
// region rules) are not failures.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function analyze(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

const PATHS = [
  "/",
  "/brands",
  "/devices",
  "/devices?vendor=xiaomi",
  "/devices/xiaomi",
  "/roms",
  "/devices/lenovo/A6020",
  "/devices/huawei/madrid",
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
