import { fetchDevices, fetchMeta, fetchRoms } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export async function loader() {
  const [devices, roms, meta] = await Promise.all([
    fetchDevices(),
    fetchRoms(),
    fetchMeta(),
  ]);

  const paths = [
    "/",
    "/devices",
    "/roms",
    "/data",
    "/registry",
    ...[...new Set(devices.map((device) => device.vendor))].map(
      (vendor) => `/devices/${vendor}`,
    ),
    ...devices.map((device) => `/devices/${device.vendor}/${device.codename}`),
    ...roms.map((rom) => `/roms/${rom.id}`),
  ];

  // The dataset is baked into each deployment, so its timestamp is the
  // meaningful last modification for every URL.
  const generatedAt = new Date(meta.generatedAt);
  const valid = !Number.isNaN(generatedAt.getTime());
  const lastmod = valid ? generatedAt.toISOString() : undefined;
  const urls = paths
    .map(
      (path) =>
        `  <url><loc>${SITE_URL}${path}</loc>${
          lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
        }</url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
        etag: `"${meta.contentHash}"`,
        ...(valid ? { "last-modified": generatedAt.toUTCString() } : {}),
      },
    },
  );
}
