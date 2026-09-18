// Order by the first letter/digit so leading punctuation (e.g. "/e/OS") does not
// push a name to the top. Display names are left untouched.
export function sortKey(value: string): string {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();
}

export function bySortKey(a: string, b: string): number {
  return sortKey(a).localeCompare(sortKey(b));
}

// A reference URL shown as `host/path` (scheme and trailing slash dropped), so
// the column stays scannable while the link target keeps the exact URL.
export function referenceLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, "");
    const search = parsed.search;
    return `${parsed.host}${path}${search}`;
  } catch {
    return url;
  }
}
