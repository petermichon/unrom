import { expect, test } from "@playwright/test";

// `/devices` is both the browsable directory and the search results page. These
// tests pin the switch between the two modes, because the page header and the
// filter chips are what make the results state legible.

test("a query turns the directory into a results page", async ({ page }) => {
  await page.goto("/devices?q=pixel");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Devices matching “pixel”",
  );
  await expect(page.getByRole("status")).toContainText(/matching devices/);
  // The standing note about bootloaders belongs to the directory, not results.
  await expect(page.getByText(/bootloader can be unlocked/)).toHaveCount(0);
});

test("the unfiltered directory keeps its explanatory note", async ({
  page,
}) => {
  await page.goto("/devices");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Devices");
  await expect(page.getByText(/bootloader can be unlocked/)).toBeVisible();
});

test("each active filter is a chip that removes only itself", async ({
  page,
}) => {
  await page.goto("/devices?roms=1&relock=supported");

  const chip = page.getByRole("link", { name: "Remove filter: Has ROMs" });
  await expect(chip).toBeVisible();
  await expect(chip).toHaveAttribute("href", "/devices?relock=supported");

  const relock = page.getByRole("link", {
    name: "Remove filter: Relock supported",
  });
  await expect(relock).toHaveAttribute("href", "/devices?roms=1");

  await chip.click();
  await page.waitForURL("**/devices?relock=supported");
  await expect(
    page.getByRole("link", { name: "Remove filter: Has ROMs" }),
  ).toHaveCount(0);
});

test("an empty query result suggests a codename and a way back", async ({
  page,
}) => {
  await page.goto("/devices?q=zzzznotadevice");

  await expect(
    page.getByText(/Nothing in the directory matches/),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "shiba" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "browse every device" }),
  ).toBeVisible();
});

test("the unfiltered directory states how many devices have ROMs", async ({
  page,
}) => {
  await page.goto("/devices");

  const status = page.getByRole("status");
  await expect(status).toContainText(/with ROMs/);
  await expect(status.getByRole("link")).toHaveAttribute(
    "href",
    "/devices?roms=1",
  );
});

test("the filter row names the three kinds of filter", async ({ page }) => {
  await page.goto("/devices");

  await expect(page.getByText("Brand", { exact: true })).toBeVisible();
  await expect(page.getByText("Coverage", { exact: true })).toBeVisible();
  await expect(page.getByText("Properties", { exact: true })).toBeVisible();
});
