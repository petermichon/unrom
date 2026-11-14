import { useRef, useState } from "react";
import { Form, Link, useNavigate } from "react-router";
import { useSearchDialog } from "@/components/CommandPalette";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SEARCH_PLACEHOLDER, tokenize } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/use-search";

interface Props {
  examples?: string[];
}

/**
 * Below this width the hero field is a way into the one search surface rather
 * than a second one: the dialog owns the screen, the keyboard and the results.
 */
const COMPACT_QUERY = "(max-width: 1023px)";

function isCompact(): boolean {
  return window.matchMedia(COMPACT_QUERY).matches;
}

export default function DeviceSearch({ examples = [] }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { openSearch } = useSearchDialog();
  const { data, loading, error } = useSearch(query);
  const terms = tokenize(query);
  const hasResults =
    data.devices.length > 0 || data.brands.length > 0 || data.roms.length > 0;

  const noResults =
    !error &&
    terms.length > 0 &&
    !loading &&
    data.totals.devices === 0 &&
    data.totals.brands === 0 &&
    data.totals.roms === 0;

  const tryExample = (example: string) => {
    if (isCompact()) {
      openSearch(example);
      return;
    }
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
          className="border border-border bg-popover shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:border-white/15 dark:bg-white/[0.06]"
        >
          <CommandInput
            name="q"
            ref={inputRef}
            seamless
            inputMode="search"
            className="text-base"
            aria-label="Search devices, brands, and ROMs"
            placeholder={SEARCH_PLACEHOLDER}
            autoCapitalize="none"
            enterKeyHint="search"
            value={query}
            onValueChange={setQuery}
            // Opens on release like any button. Suppressing the pointerdown's
            // default keeps the caret and keyboard from flashing here first;
            // the dialog's own field takes focus. Click still fires.
            onPointerDown={(event) => {
              if (isCompact()) event.preventDefault();
            }}
            onClick={() => {
              if (isCompact()) openSearch();
            }}
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
          <div>
            <CommandList
              className={cn(
                "overscroll-contain",
                // Grows with its content: a fixed height left an empty panel
                // under the field while loading and when nothing matched, and
                // could not fit above a phone keyboard.
                terms.length > 0 ? "max-h-[min(22rem,50dvh)]" : "max-h-none",
                loading && !hasResults && "min-h-24",
              )}
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
                          {device.vendorName}{" "}
                          <span className="font-mono">({device.codename})</span>
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
              {!error &&
                terms.length > 0 &&
                !loading &&
                data.totals.devices > 0 && (
                  <CommandGroup heading="All results">
                    <CommandItem
                      value="all-devices"
                      onSelect={() =>
                        navigate(
                          `/devices?q=${encodeURIComponent(query.trim())}`,
                        )
                      }
                      className="gap-3"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium">
                        Every device matching “{query.trim()}”
                      </span>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[11px] font-normal text-muted-foreground tabular-nums"
                      >
                        {data.totals.devices}
                      </Badge>
                    </CommandItem>
                  </CommandGroup>
                )}
            </CommandList>
            {error && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Search is unavailable right now. Check your connection and try
                again.
              </p>
            )}
            {noResults && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No matches for “{query.trim()}”. Try a codename, or browse{" "}
                <Link to="/devices" className="text-foreground hover:underline">
                  devices
                </Link>
                ,{" "}
                <Link to="/brands" className="text-foreground hover:underline">
                  brands
                </Link>
                , or{" "}
                <Link to="/roms" className="text-foreground hover:underline">
                  ROMs
                </Link>
                .
              </p>
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
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span className="text-panel-foreground/70">Try:</span>
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
              className="h-auto min-h-11 cursor-pointer border-transparent bg-panel-foreground/[0.06] px-2.5 py-2 text-xs font-normal text-panel-foreground/70 hover:bg-panel-foreground/10 hover:text-panel-foreground"
            >
              {example}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
