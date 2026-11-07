import { fetchMeta, fetchRoms } from "@/lib/data";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const [roms, meta] = await Promise.all([fetchRoms(), fetchMeta()]);
  return sitemapResponse(
    roms.filter((rom) => rom.deviceCount > 0).map((rom) => `/roms/${rom.id}`),
    meta,
    "roms",
  );
}
