import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { BrowseDevice, RomChip } from "@/lib/types";

interface Props {
  devices: BrowseDevice[];
  roms: RomChip[];
  examples?: string[];
}

// cmdk renders and measures every item, so with hundreds of records we filter
// ourselves and only render the top matches.
const DEVICE_LIMIT = 50;
const ROM_LIMIT = 20;

function matchesDevice(device: BrowseDevice, query: string): boolean {
  return (
    (device.name ?? "").toLowerCase().includes(query) ||
    device.codename.toLowerCase().includes(query) ||
    device.vendorName.toLowerCase().includes(query)
  );
}

export default function DeviceSearch({ devices, roms, examples = [] }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const { deviceResults, deviceTotal, romResults, romTotal } = useMemo(() => {
    if (needle === "")
      return { deviceResults: [], deviceTotal: 0, romResults: [], romTotal: 0 };

    const deviceMatches = devices.filter((device) =>
      matchesDevice(device, needle),
    );
    const romMatches = roms.filter((rom) =>
      rom.name.toLowerCase().includes(needle),
    );

    return {
      deviceResults: deviceMatches.slice(0, DEVICE_LIMIT),
      deviceTotal: deviceMatches.length,
      romResults: romMatches.slice(0, ROM_LIMIT),
      romTotal: romMatches.length,
    };
  }, [devices, roms, needle]);

  const noResults = needle !== "" && deviceTotal === 0 && romTotal === 0;
  const truncated =
    deviceTotal > deviceResults.length || romTotal > romResults.length;

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
          aria-label="Search devices and ROMs"
          placeholder="Search by device name, codename, brand, or ROM…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[26rem]">
          {noResults && <CommandEmpty>No matches found.</CommandEmpty>}
          {deviceResults.length > 0 && (
            <CommandGroup heading="Devices">
              {deviceResults.map((device) => (
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
          {romResults.length > 0 && (
            <CommandGroup heading="ROMs">
              {romResults.map((rom) => (
                <CommandItem
                  key={`rom-${rom.id}`}
                  value={`rom-${rom.id}`}
                  onSelect={() => navigate(`/roms/${rom.id}`)}
                >
                  {rom.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {truncated && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Showing top matches — refine your search.
            </div>
          )}
        </CommandList>
      </Command>

      {examples.length > 0 && (
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
