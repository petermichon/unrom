import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://unrom.com";
export const SITE_NAME = "unrom";
export const OG_IMAGE = `${SITE_URL}/og.png`;

const SITE_DESCRIPTION =
  "The open database for device–ROM compatibility: every custom ROM and the devices it supports.";

/** Site-wide identity, emitted on every page. */
function siteGraph(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
      },
    ],
  };
}

export function canonical(path: string): MetaDescriptor {
  return { tagName: "link", rel: "canonical", href: `${SITE_URL}${path}` };
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
}

/**
 * Title, description and social tags for a page. Engines fall back to page
 * body text when a description is missing or too generic, which is how
 * navigation chrome ends up in search snippets — so every page passes one.
 */
export function pageMeta({
  title,
  description,
  path,
  type = "website",
  image = OG_IMAGE,
}: PageMetaInput): MetaDescriptor[] {
  const url = `${SITE_URL}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { "script:ld+json": siteGraph() },
    canonical(path),
  ];
}

/** Titles for error states; always keep them out of the index. */
export function errorMeta(
  title = "Something went wrong — unrom",
): MetaDescriptor[] {
  return [{ title }, { name: "robots", content: "noindex" }];
}

/** Dataset-level freshness, surfaced to engines instead of leaving them to guess. */
export function modifiedMeta(
  date: string | null | undefined,
): MetaDescriptor[] {
  if (!date) return [];
  return [{ property: "og:updated_time", content: date }];
}

/** The root loader's data timestamp, for per-page freshness metadata. */
export function updatedAtFromMatches(
  matches: ReadonlyArray<{ id: string; loaderData?: unknown } | undefined>,
): string | undefined {
  const root = matches.find((match) => match?.id === "root");
  const data = root?.loaderData as { updatedAt?: string } | undefined;
  return data?.updatedAt;
}

/** Join up to `limit` names as a readable list, then summarise the rest. */ export function summarizeNames(
  names: string[],
  limit = 3,
  total = names.length,
): string {
  if (names.length === 0) return "";
  const shown = names.slice(0, limit).join(", ");
  const rest = total - Math.min(limit, names.length);
  return rest > 0 ? `${shown} and ${rest} more` : shown;
}

interface JsonLdItem {
  name: string;
  path: string;
}

/** `ItemList` for pages whose main content is a list of entities. */
export function itemListLd(
  name: string,
  items: JsonLdItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

interface BreadcrumbLdItem {
  label: string;
  to?: string;
}

export function breadcrumbLd(
  items: BreadcrumbLdItem[],
  pathname: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.to ?? pathname}`,
    })),
  };
}

/**
 * JSON-LD is embedded in the HTML, so escape `<` to keep arbitrary data from
 * closing the script element.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
