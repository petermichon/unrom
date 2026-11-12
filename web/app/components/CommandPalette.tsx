import { useEffect, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import CommandPaletteDialog from "@/components/CommandPaletteDialog";
import { Button } from "@/components/ui/button";
import { fetchRomSummaries, fetchSummary } from "@/lib/data";
import type { BrowseDevice, RomSummary } from "@/lib/types";

export interface Suggestions {
  devices: BrowseDevice[];
  roms: RomSummary[];
}

const subscribe = () => () => {};

/** The shortcut keycap reads the platform on the client, null on the server. */
function useShortcutLabel(): string | null {
  return useSyncExternalStore(
    subscribe,
    () =>
      /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
        ? "⌘K"
        : "Ctrl K",
    () => null,
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const shortcut = useShortcutLabel();

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
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search devices, brands, and ROMs"
        aria-keyshortcuts="Control+K Meta+K"
        data-nojs-hide
        title={shortcut ? `Search (${shortcut})` : "Search"}
        className="text-muted-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        {shortcut && (
          <kbd className="ml-1 hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground md:inline-block">
            {shortcut}
          </kbd>
        )}
      </Button>

      {open && (
        <CommandPaletteDialog
          open={open}
          onOpenChange={setOpen}
          suggestions={suggestions}
        />
      )}
    </>
  );
}
