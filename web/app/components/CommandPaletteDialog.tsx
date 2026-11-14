import { useLayoutEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SEARCH_PLACEHOLDER, tokenize } from "@/lib/search";
import { useSearch } from "@/lib/use-search";
import type { Suggestions } from "@/components/CommandPalette";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: Suggestions | null;
  /** Query to start with, for a caller that already knows what was asked. */
  initialQuery?: string;
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
export default function CommandPaletteDialog({
  open,
  onOpenChange,
  suggestions,
  initialQuery = "",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
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

  // Base UI locks the document with `overflow: hidden` on <html>, which iOS
  // ignores: the page behind a modal still pans, and the keyboard's reveal
  // scroll drags it. Pinning the body is the lock that holds there. Taking the
  // <html> overflow first also stops Base UI layering its own lock on top: it
  // would snapshot the pinned body and restore that snapshot on close, leaving
  // the page stuck. `scrollbar-gutter` keeps the page from shifting when the
  // scrollbar goes.
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previousOverflow = html.style.overflow;
    const previousGutter = html.style.scrollbarGutter;
    const previous = body.style.cssText;
    html.style.overflow = "hidden";
    html.style.scrollbarGutter = "stable";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.cssText = previous;
      html.style.overflow = previousOverflow;
      html.style.scrollbarGutter = previousGutter;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search unrom"
      description="Find a device, brand, or ROM"
      className="top-4! h-[min(28rem,calc(100dvh-2rem))] grid-rows-[1fr]"
    >
      <Command shouldFilter={false}>
        <CommandInput
          seamless
          className="text-base"
          aria-label="Search devices, brands, and ROMs"
          placeholder={SEARCH_PLACEHOLDER}
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
          <CommandList className="h-full max-h-none overscroll-contain">
            {!error && terms.length === 0 && suggestions?.devices.length ? (
              <CommandGroup heading="Top devices">
                {suggestions.devices.map((device) => (
                  <CommandItem
                    key={`suggest-${device.vendor}-${device.codename}`}
                    value={`suggest-${device.vendor}-${device.codename}`}
                    onSelect={() =>
                      go(`/devices/${device.vendor}/${device.codename}`)
                    }
                  >
                    <span className="truncate">
                      {device.name ?? device.codename}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {device.roms.length}{" "}
                      {device.roms.length === 1 ? "ROM" : "ROMs"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {!error && terms.length === 0 && suggestions?.roms.length ? (
              <CommandGroup heading="Top ROMs">
                {suggestions.roms.map((rom) => (
                  <CommandItem
                    key={`suggest-${rom.id}`}
                    value={`suggest-${rom.name}`}
                    onSelect={() => go(`/roms/${rom.id}`)}
                  >
                    {rom.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {rom.deviceCount} devices
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
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
            {!error &&
              terms.length > 0 &&
              !loading &&
              data.totals.devices > 0 && (
                <CommandGroup heading="All results">
                  <CommandItem
                    value="all-devices"
                    onSelect={() =>
                      go(`/devices?q=${encodeURIComponent(query.trim())}`)
                    }
                  >
                    <span className="truncate">
                      Every device matching “{query.trim()}”
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {data.totals.devices}
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
          </CommandList>
          {error ? (
            <Notice status>Search is unavailable right now.</Notice>
          ) : terms.length === 0 &&
            (!suggestions ||
              (suggestions.devices.length === 0 &&
                suggestions.roms.length === 0)) ? (
            <Notice>Type to search devices, brands, and ROMs.</Notice>
          ) : noResults ? (
            <Notice status>No results found.</Notice>
          ) : null}
        </div>
      </Command>
    </CommandDialog>
  );
}
