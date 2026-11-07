import { fetchDeviceLetters, fetchMeta } from "@/lib/data";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const [letters, meta] = await Promise.all([
    fetchDeviceLetters(),
    fetchMeta(),
  ]);
  return sitemapResponse(
    [
      "/",
      "/devices",
      ...letters
        .filter((letter) => letter.withRoms > 0)
        .map(
          (letter) =>
            `/devices/letter/${letter.letter === "#" ? "0-9" : letter.letter.toLowerCase()}`,
        ),
      "/brands",
      "/roms",
    ],
    meta,
    "pages",
  );
}
