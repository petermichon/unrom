import { expect, test } from "@playwright/test";

const DATE = /\d{1,2} [A-Z][a-z]{2} \d{4}/;

test("ROM pages state the newest build when every device reports one", async ({
  page,
}) => {
  await page.goto("/roms/grapheneos");

  await expect(
    page.getByText(new RegExp(`Newest build ${DATE.source}`)),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Source", exact: true }),
  ).toHaveAttribute("href", "https://grapheneos.org/releases");
});

test("an active project with an old last build is labelled", async ({
  page,
}) => {
  // Active since the catalogue only says it ships something; the newest build
  // is from 2023, which the page has to say out loud.
  await page.goto("/roms/pixelextended");
  await expect(page.getByText("Last build 3 years ago")).toBeVisible();

  await page.goto("/roms/witaqua");
  await expect(page.getByText("Last build over a year ago")).toBeVisible();

  // A current build needs no label.
  await page.goto("/roms/crdroid");
  await expect(page.getByText(/^Last build /)).toHaveCount(0);
});

test("ROM pages say how many devices report a build", async ({ page }) => {
  await page.goto("/roms/lineageos");

  await expect(
    page.getByText(
      new RegExp(
        `Newest build ${DATE.source} · build dates for [\\d,]+ of [\\d,]+ devices`,
      ),
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Source", exact: true }),
  ).toHaveAttribute("href", "https://download.lineageos.org/");
});
