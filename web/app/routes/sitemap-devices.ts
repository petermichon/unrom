import { fetchDevices, fetchMeta } from "@/lib/data";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const [devices, meta] = await Promise.all([fetchDevices(), fetchMeta()]);
  return sitemapResponse(
    devices
      .filter((device) => device.roms.length > 0)
      .map((device) => `/devices/${device.vendor}/${device.codename}`),
    meta,
    "devices",
  );
}
