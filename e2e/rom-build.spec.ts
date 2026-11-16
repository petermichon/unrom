import { expect, test } from "@playwright/test";

const DATE = /\d{1,2} [A-Z][a-z]{2} \d{4}/;

test("ROM pages state the newest build when every device reports one", async ({
  page,
}) => {
  await page.goto("/roms/grapheneos");

  await expect(
    page.getByText(new RegExp(`Newest build ${DATE.source}`)),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Source" })).toHaveAttribute(
    "href",
    "https://grapheneos.org/releases",
  );
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
  await expect(page.getByRole("link", { name: "Source" })).toHaveAttribute(
    "href",
    "https://download.lineageos.org/",
  );
});
