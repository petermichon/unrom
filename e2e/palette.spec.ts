import { expect, test } from "@playwright/test";

/**
 * The per-ROM palettes are derived from three values (hue, tint, accent), so
 * the derivation itself is what gets checked: every ROM must clear body-text
 * and link contrast in both themes, and its panel must stay a tint rather than
 * a fill.
 */
const ROMS = [
  "lineageos",
  "grapheneos",
  "eos",
  "crdroid",
  "derpfest",
  "evolutionx",
  "kali-nethunter",
  "pixelos",
  "alphadroid",
  "projectinfinityx",
];

type Colours = {
  panel: number[];
  text: number;
  link: number;
  panelVsPage: number;
};

test.describe("ROM palettes stay calibrated", () => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(scheme, () => {
      test.use({ colorScheme: scheme });

      for (const rom of ROMS) {
        test(`${rom}`, async ({ page }) => {
          await page.goto(`/roms/${rom}`);
          await page.waitForFunction(
            (id) => document.documentElement.dataset.rom === id,
            rom,
          );

          const colours = await page.evaluate<Colours>(() => {
            const read = (name: string) =>
              getComputedStyle(document.documentElement)
                .getPropertyValue(name)
                .trim();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d")!;
            const toRgb = (value: string) => {
              context.clearRect(0, 0, 1, 1);
              context.fillStyle = "#000";
              context.fillStyle = value;
              context.fillRect(0, 0, 1, 1);
              return Array.from(
                context.getImageData(0, 0, 1, 1).data.slice(0, 3),
              );
            };
            const channel = (value: number) => {
              const c = value / 255;
              return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            };
            const luminance = (rgb: number[]) =>
              0.2126 * channel(rgb[0]) +
              0.7152 * channel(rgb[1]) +
              0.0722 * channel(rgb[2]);
            const ratio = (a: number[], b: number[]) => {
              const [hi, lo] = [luminance(a), luminance(b)].sort(
                (x, y) => y - x,
              );
              return (hi + 0.05) / (lo + 0.05);
            };

            const panel = toRgb(read("--panel"));
            const background = toRgb(read("--background"));
            return {
              panel,
              text: ratio(toRgb(read("--panel-foreground")), panel),
              link: ratio(toRgb(read("--brand")), background),
              panelVsPage: ratio(panel, background),
            };
          });

          // Body text on the panel is 15px, so aim at AAA rather than AA.
          expect(colours.text, "panel text contrast").toBeGreaterThan(7);
          expect(colours.link, "link contrast on the page").toBeGreaterThan(
            4.5,
          );
          // A tint, not a fill: the panel must separate from the page.
          expect(colours.panelVsPage, "panel vs page").toBeGreaterThan(1.05);
        });
      }
    });
  }
});
