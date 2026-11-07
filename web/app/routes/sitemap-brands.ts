import { fetchBrands, fetchMeta } from "@/lib/data";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const [brands, meta] = await Promise.all([fetchBrands(), fetchMeta()]);
  return sitemapResponse(
    brands
      .filter((brand) => brand.withRoms > 0)
      .map((brand) => `/devices/${brand.vendor}`),
    meta,
    "brands",
  );
}
