import { fetchDevices, fetchMeta } from "@/lib/data";
import { sitemapResponse } from "@/lib/sitemap";

export async function loader() {
  const [devices, meta] = await Promise.all([fetchDevices(), fetchMeta()]);
  const vendors = [...new Set(devices.map((device) => device.vendor))].sort();
  return sitemapResponse(
    vendors.map((vendor) => `/devices/${vendor}`),
    meta,
    "brands",
  );
}
