import { fetchMeta } from "@/lib/data";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const meta = await fetchMeta();
  return sitemapResponse(
    ["/", "/data", "/legal", "/devices", "/brands", "/roms"],
    meta,
    "pages",
  );
}
