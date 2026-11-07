import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import CommandPaletteDialog from "@/components/CommandPaletteDialog";
import { Button } from "@/components/ui/button";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

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
        title="Search (⌘K)"
        className="text-muted-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>

      {open && <CommandPaletteDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
