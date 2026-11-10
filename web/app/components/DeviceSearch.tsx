import { useRef, useState, useSyncExternalStore } from "react";
import { Form, Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { tokenize } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/use-search";

interface Props {
  examples?: string[];
}

const SEARCH_PLACEHOLDER = "Search by device name, codename, brand, or ROM…";
const MOBILE_SEARCH_PLACEHOLDER = "Search devices or ROMs…";

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default function DeviceSearch({ examples = [] }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const placeholder = useMediaQuery("(max-width: 640px)")
    ? MOBILE_SEARCH_PLACEHOLDER
    : SEARCH_PLACEHOLDER;
  const { data, loading, error } = useSearch(query);
  const terms = tokenize(query);

  const noResults =
    !error &&
    terms.length > 0 &&
    !loading &&
    data.totals.devices === 0 &&
    data.totals.brands === 0 &&
    data.totals.roms === 0;
  const truncated =
    data.totals.devices > data.devices.length ||
    data.totals.brands > data.brands.length ||
    data.totals.roms > data.roms.length;

  const tryExample = (example: string) => {
    setQuery(example);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <Form
        method="get"
        action="/devices"
        onSubmit={(event) => {
          const value = query.trim();
          if (!value) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          navigate(`/devices?q=${encodeURIComponent(value)}`);
        }}
      >
        <Command
          shouldFilter={false}
          className="rounded-2xl border border-border bg-popover shadow-sm dark:bg-[#12151f]"
        >
          <CommandInput
            name="q"
            ref={inputRef}
            seamless
            className="text-base"
            aria-label="Search devices, brands, and ROMs"
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
            status={loading ? "Searching…" : null}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              const active = event.currentTarget
                .closest("[data-slot=command]")
                ?.querySelector('[cmdk-item][data-selected="true"]');
              if (active) return;
              const value = query.trim();
              if (!value) return;
              event.preventDefault();
              navigate(`/devices?q=${encodeURIComponent(value)}`);
            }}
          />
          <div className="relative">
            <CommandList
              className={cn("max-h-none", terms.length > 0 && "h-80 sm:h-96")}
            >
              {!error && data.brands.length > 0 && (
                <CommandGroup heading="Brands">
                  {data.brands.map((brand) => (
                    <CommandItem
                      key={`brand-${brand.vendor}`}
                      value={`brand-${brand.vendor}`}
                      onSelect={() => navigate(`/devices/${brand.vendor}`)}
                      className="gap-3"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {brand.vendorName}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[11px] font-normal text-muted-foreground"
                      >
                        {brand.deviceCount}{" "}
                        {brand.deviceCount === 1 ? "device" : "devices"}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {!error && data.devices.length > 0 && (
                <CommandGroup heading="Devices">
                  {data.devices.map((device) => (
                    <CommandItem
                      key={`device-${device.vendor}-${device.codename}`}
                      value={`device-${device.vendor}-${device.codename}`}
                      onSelect={() =>
                        navigate(`/devices/${device.vendor}/${device.codename}`)
                      }
                      className="gap-3"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {device.name ?? device.codename}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {[device.vendorName, device.codename].join(" · ")}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[11px] font-normal text-muted-foreground"
                      >
                        {device.roms.length}{" "}
                        {device.roms.length === 1 ? "ROM" : "ROMs"}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {!error && data.roms.length > 0 && (
                <CommandGroup heading="ROMs">
                  {" "}
                  {data.roms.map((rom) => (
                    <CommandItem
                      key={`rom-${rom.id}`}
                      value={`rom-${rom.id}`}
                      onSelect={() => navigate(`/roms/${rom.id}`)}
                      className="gap-3"
                    >
                      <span className="truncate font-medium">{rom.name}</span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[11px] font-normal text-muted-foreground"
                      >
                        {rom.deviceCount === 0
                          ? "No device data"
                          : `${rom.deviceCount} ${
                              rom.deviceCount === 1 ? "device" : "devices"
                            }`}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {!error && truncated && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Showing top matches. Refine your search.
                </p>
              )}
            </CommandList>
            {error && (
              <div className="absolute inset-0 grid place-items-center px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Search is unavailable right now. Check your connection and try
                  again.
                </p>
              </div>
            )}
            {noResults && (
              <div className="absolute inset-0 grid place-items-center px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No matches for “{query.trim()}”. Try a codename, or browse{" "}
                  <Link
                    to="/devices"
                    className="text-foreground hover:underline"
                  >
                    devices
                  </Link>
                  ,{" "}
                  <Link
                    to="/brands"
                    className="text-foreground hover:underline"
                  >
                    brands
                  </Link>
                  , or{" "}
                  <Link to="/roms" className="text-foreground hover:underline">
                    ROMs
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
          {/* Live region only: the visible state lives inside the field, so the
            box keeps its height while a request is in flight. */}
          <div role="status" aria-live="polite" className="sr-only">
            {terms.length > 0 && !loading && (
              <span>
                {error
                  ? "Search unavailable"
                  : `${data.totals.devices} ${
                      data.totals.devices === 1 ? "device" : "devices"
                    }, ${data.totals.brands} ${
                      data.totals.brands === 1 ? "brand" : "brands"
                    }, ${data.totals.roms} ${
                      data.totals.roms === 1 ? "ROM" : "ROMs"
                    }`}
              </span>
            )}
          </div>
        </Command>
      </Form>

      {examples.length > 0 && (terms.length === 0 || noResults) && (
        <div
          data-nojs-hide
          className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <span>Try:</span>
          {examples.map((example) => (
            <Badge
              key={example}
              variant="outline"
              render={
                <button
                  type="button"
                  aria-label={`Search for ${example}`}
                  onClick={() => tryExample(example)}
                />
              }
              className="h-auto cursor-pointer px-2.5 py-1 text-xs font-normal text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            >
              {example}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
