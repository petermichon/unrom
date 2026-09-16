import { expect, test } from "@playwright/test";

// The dataset is immutable per deployment, so client-side navigations must be
// served from the in-memory cache: once a route has been visited, going back to
// it must not trigger a loader `.data` request or an `/api/*` fetch.
test("repeat client navigations do not hit the network", async ({ page }) => {
  // The harness does not proxy /api; forward client fetches to the API server.
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    const response = await route.fetch({ url: url.toString() });
    await route.fulfill({ response });
  });

  const network: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes(".data") || url.includes("/api/")) network.push(url);
  });

  const paths = ["/devices", "/roms", "/data", "/"];
  const link = (path: string) => page.locator(`a[href="${path}"]`).first();

  await page.goto("/");

  // Warm the cache for every top-level route with real client navigations.
  for (const path of paths) {
    await link(path).click();
    await page.waitForURL(`**${path}`);
  }

  // Any further navigation should be served entirely from memory.
  network.length = 0;
  for (const path of paths) {
    await link(path).click();
    await page.waitForURL(`**${path}`);
  }

  expect(network).toEqual([]);
});
