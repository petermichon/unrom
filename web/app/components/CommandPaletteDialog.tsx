import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Loaded on demand (see `CommandPalette`) so the command-menu code is not in
// the initial bundle.
export default function CommandPaletteDialog({ open, onOpenChange }: Props) {
  const [devices, setDevices] = useState<BrowseDevice[]>([]);
  const [roms, setRoms] = useState<RomChip[]>([]);
  const navigate = useNavigate();

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
    onOpenChange(false);
    navigate(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search unrom"
      description="Find a device or ROM"
    >
      <Command>
        <CommandInput
          aria-label="Search devices and ROMs"
          placeholder="Search devices and ROMs…"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Devices">
            {devices.map((device) => (
              <CommandItem
                key={device.codename}
                value={`${device.name ?? ""} ${device.codename} ${
                  device.brand ?? ""
                }`}
                onSelect={() => go(`/devices/${device.codename}`)}
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
                onSelect={() => go(`/roms/${rom.id}`)}
              >
                {rom.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
