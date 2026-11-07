import { fetchMeta } from "@/lib/data";
import { sitemapIndexResponse } from "@/lib/sitemap";

export async function loader() {
  const meta = await fetchMeta();
  return sitemapIndexResponse(
    [
      "/sitemap-pages.xml",
      "/sitemap-devices.xml",
      "/sitemap-brands.xml",
      "/sitemap-roms.xml",
    ],
    meta,
  );
}
