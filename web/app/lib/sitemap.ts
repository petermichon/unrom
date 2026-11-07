import type { Meta } from "@/lib/types";
import { SITE_URL } from "@/lib/seo";

const CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=3600";

function lastmod(meta: Meta): string | undefined {
  const generatedAt = new Date(meta.generatedAt);
  return Number.isNaN(generatedAt.getTime())
    ? undefined
    : generatedAt.toISOString();
}

function xmlResponse(
  body: string,
  meta: Meta,
  key: string,
  generatedAt: Date,
): Response {
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": CACHE_CONTROL,
      etag: `"${meta.contentHash}-${key}"`,
      ...(Number.isNaN(generatedAt.getTime())
        ? {}
        : { "last-modified": generatedAt.toUTCString() }),
    },
  });
}

/** A `<urlset>` for one section of the site. */
export function sitemapResponse(
  paths: readonly string[],
  meta: Meta,
  key: string,
): Response {
  const generatedAt = new Date(meta.generatedAt);
  const modified = lastmod(meta);
  const urls = paths
    .map(
      (path) =>
        `  <url><loc>${SITE_URL}${path}</loc>${
          modified ? `<lastmod>${modified}</lastmod>` : ""
        }</url>`,
    )
    .join("\n");

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    meta,
    key,
    generatedAt,
  );
}

/** The `<sitemapindex>` that points at each section sitemap. */
export function sitemapIndexResponse(
  paths: readonly string[],
  meta: Meta,
): Response {
  const generatedAt = new Date(meta.generatedAt);
  const modified = lastmod(meta);
  const entries = paths
    .map(
      (path) =>
        `  <sitemap><loc>${SITE_URL}${path}</loc>${
          modified ? `<lastmod>${modified}</lastmod>` : ""
        }</sitemap>`,
    )
    .join("\n");

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`,
    meta,
    "index",
    generatedAt,
  );
}
