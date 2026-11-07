import { fetchBrands, fetchMeta } from "@/lib/data";
import { isUsefulDirectoryPage } from "@/lib/indexing";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const [brands, meta] = await Promise.all([fetchBrands(), fetchMeta()]);
  return sitemapResponse(
    brands
      .filter((brand) => isUsefulDirectoryPage(brand.withRoms))
      .map((brand) => `/devices/${brand.vendor}`),
    meta,
    "brands",
  );
}
