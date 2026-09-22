import { expect, test } from "@playwright/test";

test("registry looks up a codename by model name", async ({ page }) => {
  await page.goto("/registry");
  await page.getByLabel("Filter the registry").fill("sweetin");
  await expect(
    page.getByRole("link", { name: "Redmi Note 10 Pro (India)" }).first(),
  ).toBeVisible();
});

test("registry is reachable from the sidebar", async ({ page }) => {
  // The harness does not proxy /api; forward client navigations to the API.
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    url.protocol = "http:";
    url.host = "127.0.0.1:3000";
    const response = await route.fetch({ url: url.toString() });
    await route.fulfill({ response });
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Registry" }).click();
  await page.waitForURL("**/registry");
  await expect(page.getByRole("heading", { name: "Registry" })).toBeVisible();
});
