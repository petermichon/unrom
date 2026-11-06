import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { tokenize } from "@/lib/search";
import { useSearch } from "@/lib/use-search";

interface Props {
  examples?: string[];
}

export default function DeviceSearch({ examples = [] }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { data, loading } = useSearch(query);
  const terms = tokenize(query);

  const noResults =
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
      <Command
        shouldFilter={false}
        className="rounded-xl border border-border/60"
      >
        <CommandInput
          ref={inputRef}
          seamless
          className="text-base"
          aria-label="Search devices, brands, and ROMs"
          placeholder="Search by device name, codename, brand, or ROM…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[26rem]">
          {data.brands.length > 0 && (
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
          {data.devices.length > 0 && (
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
          {data.roms.length > 0 && (
            <CommandGroup heading="ROMs">
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
        </CommandList>
        {/* Persistent live region for result counts and truncation. */}
        <div role="status" aria-live="polite">
          {terms.length > 0 && (
            <span className="sr-only">
              {loading
                ? "Searching"
                : `${data.totals.devices} ${
                    data.totals.devices === 1 ? "device" : "devices"
                  }, ${data.totals.brands} ${
                    data.totals.brands === 1 ? "brand" : "brands"
                  }, ${data.totals.roms} ${
                    data.totals.roms === 1 ? "ROM" : "ROMs"
                  }`}
            </span>
          )}
          {truncated && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Showing top matches. Refine your search.
            </div>
          )}
        </div>
      </Command>

      {noResults && (
        <p className="text-sm text-muted-foreground">
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

      {examples.length > 0 && (terms.length === 0 || noResults) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
