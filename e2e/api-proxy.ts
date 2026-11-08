import type { Page } from "@playwright/test";

/**
 * Forward browser /api requests straight to the API so tests can exercise
 * client loaders without depending on the web server's own proxy.
 * The page may close while a prefetch is in flight; that aborts route.fetch and
 * must not fail the test.
 */
export async function proxyApi(page: Page): Promise<void> {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    try {
      const response = await route.fetch({ url: url.toString() });
      await route.fulfill({ response });
    } catch {
      // The page navigated away or the test ended.
    }
  });
}
