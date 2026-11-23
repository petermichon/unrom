import { expect, test } from "@playwright/test";

// The detail tables keep their sort and hidden columns in the URL: a view can
// be shared, and a reload or back/forward restores it. The loaders do not read
// those params, so changing them must not refetch the page payload.

test("the device table keeps its sort and hidden columns in the URL", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/peridot");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: /^Build/ }).click();
  await page.getByRole("menuitem", { name: "Sort descending" }).click();
  await expect(page).toHaveURL(/\?sort=build\.desc$/);
  await expect(page.locator("thead th", { hasText: "Build" })).toHaveAttribute(
    "aria-sort",
    "descending",
  );

  await page.getByRole("button", { name: "View" }).click();
  await page.getByRole("menuitemcheckbox", { name: "Reference" }).click();
  await expect(page).toHaveURL(/hide=referenceUrl/);
  await expect(page.locator("thead")).not.toContainText("Reference");

  const firstRom = page.locator("tbody tr").first().locator("td").first();
  const beforeReload = await firstRom.innerText();

  await page.reload();
  await expect(page.locator("thead")).not.toContainText("Reference");
  await expect(page.locator("thead th", { hasText: "Build" })).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  expect(await firstRom.innerText()).toBe(beforeReload);
});

test("the ROM table keeps its sort in the URL", async ({ page }) => {
  await page.goto("/roms/lineageos");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: /^Codename/ }).click();
  await page.getByRole("menuitem", { name: "Sort descending" }).click();
  await expect(page).toHaveURL(/\?sort=codename\.desc$/);
  await expect(
    page.locator("thead th", { hasText: "Codename" }),
  ).toHaveAttribute("aria-sort", "descending");

  const firstDevice = page.locator("tbody tr").first().locator("td").first();
  const beforeReload = await firstDevice.innerText();

  await page.reload();
  await expect(
    page.locator("thead th", { hasText: "Codename" }),
  ).toHaveAttribute("aria-sort", "descending");
  expect(await firstDevice.innerText()).toBe(beforeReload);
});

test("an unknown sort falls back to the default without rewriting the URL", async ({
  page,
}) => {
  await page.goto("/devices/xiaomi/peridot?sort=not-a-column");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveURL(/sort=not-a-column/);
  await expect(page.locator("tbody tr").first()).toBeVisible();
  await expect(page.locator("thead th", { hasText: "ROM" })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
});
