import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Filter controls behind a disclosure on phones; always open from `lg` up.
 * A checkbox and a label keep it working without JavaScript — the filters are
 * plain GET forms, so the whole directory stays usable with scripts off. The
 * count tells the reader what is active while the panel is closed.
 */
export function DirectoryFilterBar({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="checkbox"
        id="directory-filters-toggle"
        className="peer sr-only lg:hidden"
      />
      <label
        htmlFor="directory-filters-toggle"
        className="flex h-8 w-fit cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold select-none peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        Filters
        {activeCount > 0 && (
          <span className="text-muted-foreground">({activeCount})</span>
        )}
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      </label>
      <div className="hidden flex-wrap items-center gap-3 peer-checked:flex lg:flex">
        {children}
      </div>
    </div>
  );
}
