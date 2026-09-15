import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fetchDevices, fetchRoms } from "@/lib/data";
import type { BrowseDevice, RomChip } from "@/lib/types";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<BrowseDevice[]>([]);
  const [roms, setRoms] = useState<RomChip[]>([]);
  const navigate = useNavigate();

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

  // Load the search index on first open so it is not serialized into every page.
  useEffect(() => {
    if (!open || devices.length > 0) return;
    let cancelled = false;
    Promise.all([fetchDevices(), fetchRoms()])
      .then(([loadedDevices, loadedRoms]) => {
        if (cancelled) return;
        setDevices(loadedDevices);
        setRoms(loadedRoms.map((rom) => ({ id: rom.id, name: rom.name })));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, devices.length]);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search devices and ROMs"
        className="text-muted-foreground"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search</span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search unrom"
        description="Find a device or ROM"
      >
        <Command>
          <CommandInput placeholder="Search devices and ROMs…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Devices">
              {devices.map((device) => (
                <CommandItem
                  key={device.codename}
                  value={`${device.name ?? ""} ${device.codename} ${
                    device.brand ?? ""
                  }`}
                  onSelect={() => go(`/device/${device.codename}`)}
                >
                  <span className="truncate">
                    {device.name ?? device.codename}
                  </span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {device.codename}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="ROMs">
              {roms.map((rom) => (
                <CommandItem
                  key={rom.id}
                  value={rom.name}
                  onSelect={() => go(`/rom/${rom.id}`)}
                >
                  {rom.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
