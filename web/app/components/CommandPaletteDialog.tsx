import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Command,
  CommandDialog,
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

/** Centred message for the list area, so state changes never resize the dialog. */
function Notice({
  children,
  status = false,
}: {
  children: ReactNode;
  status?: boolean;
}) {
  return (
    <div
      role={status ? "status" : undefined}
      aria-live={status ? "polite" : undefined}
      className="absolute inset-0 grid place-items-center px-4 py-6 text-center text-sm text-muted-foreground"
    >
      {children}
    </div>
  );
}

// Mounted by `CommandPalette` while the dialog is open.
export default function CommandPaletteDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const { data, loading, error } = useSearch(query);
  const terms = tokenize(query);
  const navigate = useNavigate();

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  const noResults =
    !error &&
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
      className="h-[min(28rem,calc(67svh-2rem))] grid-rows-[1fr]"
    >
      <Command shouldFilter={false}>
        <CommandInput
          seamless
          className="text-base"
          aria-label="Search devices, brands, and ROMs"
          placeholder="Search devices, brands, and ROMs…"
          value={query}
          onValueChange={setQuery}
          status={loading ? "Searching…" : null}
        />
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Searching"
            : terms.length > 0 && !error
              ? `${data.totals.devices} ${
                  data.totals.devices === 1 ? "device" : "devices"
                }, ${data.totals.brands} ${
                  data.totals.brands === 1 ? "brand" : "brands"
                }, ${data.totals.roms} ${
                  data.totals.roms === 1 ? "ROM" : "ROMs"
                }`
              : null}
        </div>
        <div className="relative min-h-0 flex-1">
          <CommandList className="h-full max-h-none">
            {!error && data.brands.length > 0 && (
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
            {!error && data.devices.length > 0 && (
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
            {!error && data.roms.length > 0 && (
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
          {error ? (
            <Notice status>Search is unavailable right now.</Notice>
          ) : terms.length === 0 ? (
            <Notice>Type to search devices, brands, and ROMs.</Notice>
          ) : noResults ? (
            <Notice status>No results found.</Notice>
          ) : null}
        </div>
      </Command>
    </CommandDialog>
  );
}
