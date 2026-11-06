import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import CommandPaletteDialog from "@/components/CommandPaletteDialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { fetchDevices, fetchRoms } from "@/lib/data";

// Start the index fetches before the dialog is open so the first keystrokes
// already have data to match against.
function preloadSearchData() {
  void fetchDevices();
  void fetchRoms();
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        preloadSearchData();
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
        onMouseEnter={preloadSearchData}
        onFocus={preloadSearchData}
        onTouchStart={preloadSearchData}
        aria-label="Search devices, brands, and ROMs"
        className="text-muted-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="hidden bg-transparent! px-0! text-muted-foreground! sm:inline-flex">
          ⌘K
        </Kbd>
      </Button>

      {open && <CommandPaletteDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
