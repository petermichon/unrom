// Order by the first letter/digit so leading punctuation (e.g. "/e/OS") does not
// push a name to the top. Display names are left untouched.
export function sortKey(value: string): string {
  return value.replace(/^[^\p{L}\p{N}]+/u, "").toLowerCase();
}

export function bySortKey(a: string, b: string): number {
  return sortKey(a).localeCompare(sortKey(b));
}
