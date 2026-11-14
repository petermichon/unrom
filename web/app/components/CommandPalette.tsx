import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Search } from "lucide-react";
import CommandPaletteDialog from "@/components/CommandPaletteDialog";
import { Button } from "@/components/ui/button";
import { fetchRomSummaries, fetchSummary } from "@/lib/data";
import type { BrowseDevice, RomSummary } from "@/lib/types";

export interface Suggestions {
  devices: BrowseDevice[];
  roms: RomSummary[];
}

interface SearchDialog {
  /** Opens the one search surface, optionally already searching for something. */
  openSearch: (query?: string) => void;
}

const SearchContext = createContext<SearchDialog | null>(null);

export function useSearchDialog(): SearchDialog {
  const dialog = useContext(SearchContext);
  if (!dialog) {
    throw new Error("useSearchDialog must be used inside SearchProvider");
  }
  return dialog;
}

/**
 * Owns the single search dialog for the whole shell, so the header button and
 * the home page field open the same thing instead of two lookalikes.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);

  const openSearch = (query?: string) => {
    setInitialQuery(query ?? "");
    setOpen(true);
  };

  // The empty state is the mega menu's shortcut list. Load it on the first
  // open and keep it for the session, so reopening costs nothing.
  useEffect(() => {
    if (!open || suggestions) return;
    let cancelled = false;
    Promise.all([fetchSummary(), fetchRomSummaries()])
      .then(([summary, roms]) => {
        if (cancelled) return;
        setSuggestions({
          devices: summary.topDevices.slice(0, 5),
          roms: roms
            .filter((rom) => rom.status === "active" && rom.deviceCount > 0)
            .sort(
              (a, b) =>
                b.deviceCount - a.deviceCount || a.name.localeCompare(b.name),
            )
            .slice(0, 4),
        });
      })
      .catch(() => {
        if (!cancelled) setSuggestions({ devices: [], roms: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [open, suggestions]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {open && (
        <CommandPaletteDialog
          open={open}
          onOpenChange={setOpen}
          suggestions={suggestions}
          initialQuery={initialQuery}
        />
      )}
    </SearchContext.Provider>
  );
}

export default function CommandPalette() {
  const { openSearch } = useSearchDialog();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => openSearch()}
      aria-label="Search devices, brands, and ROMs"
      aria-keyshortcuts="Control+K Meta+K"
      data-nojs-hide
      className="text-muted-foreground max-sm:w-9 max-sm:px-0"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Search</span>
    </Button>
  );
}
