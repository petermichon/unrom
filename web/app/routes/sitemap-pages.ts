import { fetchDeviceLetters, fetchMeta } from "@/lib/data";
import { isUsefulDirectoryPage } from "@/lib/indexing";
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
        .filter((letter) => isUsefulDirectoryPage(letter.withRoms))
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
