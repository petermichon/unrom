import { Link } from "react-router";

export interface DirectoryChip {
  label: string;
  /** The same page with this one filter dropped. */
  href: string;
}

/**
 * Active filters as removable chips. On a results page the chips say what is
 * narrowing the list, which the filter panel cannot when it is collapsed on a
 * phone. Each chip is a plain link, so removing a filter works without scripts
 * and produces a canonical URL.
 */
export function DirectoryChips({
  chips,
  clearHref,
}: {
  chips: DirectoryChip[];
  clearHref?: string;
}) {
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            to={chip.href}
            prefetch="intent"
            aria-label={`Remove filter: ${chip.label}`}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors hover:border-panel-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {chip.label}
            <span aria-hidden="true" className="text-muted-foreground">
              ×
            </span>
          </Link>
        </li>
      ))}
      {clearHref && (
        <li>
          <Link
            to={clearHref}
            className="px-1 text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            Clear all
          </Link>
        </li>
      )}
    </ul>
  );
}
