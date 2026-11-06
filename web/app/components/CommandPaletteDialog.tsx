import { useState } from "react";
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
import { tokenize } from "@/lib/search";
import { useSearch } from "@/lib/use-search";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mounted by `CommandPalette` while the dialog is open.
export default function CommandPaletteDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const { data, loading } = useSearch(query);
  const terms = tokenize(query);
  const navigate = useNavigate();

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  const noResults =
    terms.length > 0 &&
    !loading &&
    data.totals.devices === 0 &&
    data.totals.brands === 0 &&
    data.totals.roms === 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search unrom"
      description="Find a device, brand, or ROM"
    >
      <Command shouldFilter={false}>
        <CommandInput
          seamless
          className="text-base"
          aria-label="Search devices, brands, and ROMs"
          placeholder="Search devices, brands, and ROMs…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Searching…
            </p>
          )}
          {noResults && <CommandEmpty>No results found.</CommandEmpty>}
          {data.brands.length > 0 && (
            <CommandGroup heading="Brands">
              {data.brands.map((brand) => (
                <CommandItem
                  key={`brand-${brand.vendor}`}
                  value={`brand-${brand.vendor}`}
                  onSelect={() => go(`/devices/${brand.vendor}`)}
                >
                  <span className="truncate">{brand.vendorName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {brand.deviceCount}{" "}
                    {brand.deviceCount === 1 ? "device" : "devices"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {data.devices.length > 0 && (
            <CommandGroup heading="Devices">
              {data.devices.map((device) => (
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
          {data.roms.length > 0 && (
            <CommandGroup heading="ROMs">
              {data.roms.map((rom) => (
                <CommandItem
                  key={rom.id}
                  value={rom.name}
                  onSelect={() => go(`/roms/${rom.id}`)}
                >
                  {rom.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {rom.deviceCount === 0
                      ? "No device data"
                      : `${rom.deviceCount} ${
                          rom.deviceCount === 1 ? "device" : "devices"
                        }`}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
