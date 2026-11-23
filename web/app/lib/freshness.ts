import type { RomStatus } from "@/lib/types";

const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000;

/**
 * A project can be "active" while its newest build is years old: `status` says
 * whether the project ships anything at all, not how current that is. Only an
 * active project needs the callout — a discontinued one already says so.
 *
 * Months, not days: 12 months is the first threshold, so a build from last
 * month never carries a label and a build from 14 months ago says "over a
 * year". Dates are UTC so the label cannot shift with the reader's timezone.
 */
export function staleBuildLabel(
  newest: string | null | undefined,
  status: RomStatus,
  now: Date = new Date(),
): string | null {
  if (!newest || status !== "active") return null;

  const built = new Date(`${newest}T00:00:00Z`);
  if (Number.isNaN(built.getTime())) return null;

  const months = Math.floor((now.getTime() - built.getTime()) / MONTH_MS);
  if (months < 12) return null;

  const years = Math.floor(months / 12);
  return years === 1
    ? "Last build over a year ago"
    : `Last build ${years} years ago`;
}
