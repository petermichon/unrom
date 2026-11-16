import { fetchMeta } from "@/lib/data";
import { DEVICE_GROUPS } from "@/lib/device-groups";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const meta = await fetchMeta();
  return sitemapResponse(
    [
      "/",
      "/data",
      "/legal",
      "/devices",
      "/brands",
      "/roms",
      "/device-groups",
      ...DEVICE_GROUPS.map((group) => group.path),
    ],
    meta,
    "pages",
  );
}
