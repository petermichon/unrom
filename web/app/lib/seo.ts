import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://unrom.com";

export function canonical(path: string): MetaDescriptor {
  return { tagName: "link", rel: "canonical", href: `${SITE_URL}${path}` };
}
