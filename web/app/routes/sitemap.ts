import { fetchDevices, fetchRoms } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export async function loader() {
  const [devices, roms] = await Promise.all([fetchDevices(), fetchRoms()]);

  const paths = [
    "/",
    "/devices",
    "/roms",
    "/data",
    ...[...new Set(devices.map((device) => device.vendor))].map(
      (vendor) => `/devices/${vendor}`,
    ),
    ...devices.map((device) => `/devices/${device.vendor}/${device.codename}`),
    ...roms.map((rom) => `/roms/${rom.id}`),
  ];

  const urls = paths
    .map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
