import type { Page } from "@playwright/test";

/**
 * The test harness serves the web app on 3001 without proxying /api, so client
 * fetches need forwarding. The page may close while a prefetch is in flight;
 * that aborts route.fetch and must not fail the test.
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
