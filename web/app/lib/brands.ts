import type { BrandSummary } from "@/lib/types";
import { byDirectoryName } from "@/lib/sort";

export type Brand = BrandSummary;

/**
 * Brand directory order: the brands custom-ROM users are most likely to look
 * for first (those with the most ROM-covered devices), then the largest
 * catalogues, with the A–Z comparator as a stable, hidden tiebreaker.
 */
export function brandRanking(brands: readonly BrandSummary[]): Brand[] {
  return [...brands].sort(
    (a, b) =>
      b.withRoms - a.withRoms ||
      b.deviceCount - a.deviceCount ||
      byDirectoryName(a.vendorName, b.vendorName),
  );
}
