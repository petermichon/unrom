import { SearchIcon } from "lucide-react";
import { Link } from "react-router";
import { useSearchDialog } from "@/components/CommandPalette";
import { Badge } from "@/components/ui/badge";
import { SEARCH_PLACEHOLDER } from "@/lib/search";

interface Props {
  examples?: string[];
}

/**
 * The hero's way into the one search surface. It looks like a field but is a
 * link: with scripts it opens the dialog, without them it is the device
 * directory. Either way there is only one search to learn.
 */
export default function DeviceSearch({ examples = [] }: Props) {
  const { openSearch } = useSearchDialog();

  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/devices"
        aria-label="Search devices, brands, and ROMs"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault();
          openSearch();
        }}
        className="flex h-12 w-full items-center gap-2 rounded-xl border border-border bg-popover px-4 text-base text-muted-foreground shadow-sm outline-none transition-colors hover:border-ring/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-white/15 dark:bg-white/[0.06]"
      >
        <SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        <span className="truncate">{SEARCH_PLACEHOLDER}</span>
      </Link>

      {examples.length > 0 && (
        <div
          data-nojs-hide
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span className="text-panel-foreground/70">Try:</span>
          {examples.map((example) => (
            <Badge
              key={example}
              variant="outline"
              render={
                <button
                  type="button"
                  aria-label={`Search for ${example}`}
                  onClick={() => openSearch(example)}
                />
              }
              className="h-auto min-h-11 cursor-pointer border-transparent bg-panel-foreground/[0.06] px-2.5 py-2 text-xs font-normal text-panel-foreground/70 hover:bg-panel-foreground/10 hover:text-panel-foreground"
            >
              {example}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
