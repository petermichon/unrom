import { SearchIcon } from "lucide-react";
import { Link } from "react-router";
import { useSearchDialog } from "@/components/CommandPalette";
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
        className="flex h-12 w-full items-center gap-2 rounded-xl border border-border bg-popover px-4 text-base text-muted-foreground shadow-sm outline-none transition-colors hover:border-panel-foreground/25 hover:text-panel-foreground focus-visible:border-panel-foreground/60 focus-visible:ring-3 focus-visible:ring-panel-foreground dark:border-white/15 dark:bg-white/[0.06]"
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
            <button
              key={example}
              type="button"
              aria-label={`Search for ${example}`}
              onClick={() => openSearch(example)}
              className="inline-flex min-h-11 items-center rounded-full border border-transparent bg-panel-foreground/[0.06] px-2.5 text-xs font-normal text-panel-foreground/70 outline-none hover:bg-panel-foreground/10 hover:text-panel-foreground focus-visible:ring-3 focus-visible:ring-panel-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
