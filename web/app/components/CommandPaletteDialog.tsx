import { useEffect, useMemo, useState } from "react";
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

// cmdk measures every rendered item, so filter ourselves and cap the results.
const DEVICE_LIMIT = 12;
const ROM_LIMIT = 12;
const VENDOR_LIMIT = 6;

interface VendorResult {
  vendor: string;
  vendorName: string;
  deviceCount: number;
}

// Loaded on demand (see `CommandPalette`) so the command-menu code is not in
// the initial bundle.
export default function CommandPaletteDialog({ open, onOpenChange }: Props) {
  const [devices, setDevices] = useState<BrowseDevice[]>([]);
  const [roms, setRoms] = useState<RomChip[]>([]);
  const [query, setQuery] = useState("");
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

  const needle = query.trim().toLowerCase();
  const vendors = useMemo<VendorResult[]>(() => {
    const map = new Map<string, VendorResult>();
    for (const device of devices) {
      const entry = map.get(device.vendor) ?? {
        vendor: device.vendor,
        vendorName: device.vendorName,
        deviceCount: 0,
      };
      entry.deviceCount++;
      map.set(device.vendor, entry);
    }
    return [...map.values()].sort((a, b) =>
      a.vendorName.localeCompare(b.vendorName),
    );
  }, [devices]);
  const deviceMatches = useMemo(
    () =>
      needle === ""
        ? []
        : devices
            .filter(
              (device) =>
                (device.name ?? "").toLowerCase().includes(needle) ||
                device.codename.toLowerCase().includes(needle) ||
                device.vendorName.toLowerCase().includes(needle),
            )
            .slice(0, DEVICE_LIMIT),
    [devices, needle],
  );
  const romMatches = useMemo(
    () =>
      needle === ""
        ? []
        : roms
            .filter((rom) => rom.name.toLowerCase().includes(needle))
            .slice(0, ROM_LIMIT),
    [roms, needle],
  );
  const vendorMatches = useMemo(
    () =>
      needle === ""
        ? []
        : vendors
            .filter(
              (vendor) =>
                vendor.vendorName.toLowerCase().includes(needle) ||
                vendor.vendor.toLowerCase().includes(needle),
            )
            .slice(0, VENDOR_LIMIT),
    [vendors, needle],
  );

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  const noResults =
    needle !== "" &&
    deviceMatches.length === 0 &&
    romMatches.length === 0 &&
    vendorMatches.length === 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search unrom"
      description="Find a device, vendor, or ROM"
    >
      <Command shouldFilter={false}>
        <CommandInput
          aria-label="Search devices, vendors, and ROMs"
          placeholder="Search devices, vendors, and ROMs…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {noResults && <CommandEmpty>No results found.</CommandEmpty>}
          {vendorMatches.length > 0 && (
            <CommandGroup heading="Vendors">
              {vendorMatches.map((vendor) => (
                <CommandItem
                  key={`vendor-${vendor.vendor}`}
                  value={`vendor-${vendor.vendor}`}
                  onSelect={() => go(`/devices/${vendor.vendor}`)}
                >
                  <span className="truncate">{vendor.vendorName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {vendor.deviceCount}{" "}
                    {vendor.deviceCount === 1 ? "device" : "devices"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {deviceMatches.length > 0 && (
            <CommandGroup heading="Devices">
              {deviceMatches.map((device) => (
                <CommandItem
                  key={`${device.vendor}-${device.codename}`}
                  value={`${device.vendor}-${device.codename}`}
                  onSelect={() =>
                    go(`/devices/${device.vendor}/${device.codename}`)
                  }
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
          )}
          {romMatches.length > 0 && (
            <CommandGroup heading="ROMs">
              {romMatches.map((rom) => (
                <CommandItem
                  key={rom.id}
                  value={rom.name}
                  onSelect={() => go(`/roms/${rom.id}`)}
                >
                  {rom.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
