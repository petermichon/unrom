export { cn } from "cn";

/** Locale-stable thousands separators (server and client agree). */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
