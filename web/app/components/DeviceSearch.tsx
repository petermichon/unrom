import { useMemo, useState } from "react";
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
import type { BrowseDevice } from "@/lib/types";

interface Props {
  devices: BrowseDevice[];
}

// cmdk renders and measures every item, so with hundreds of devices we filter
// ourselves and only render the top matches.
const MAX_RESULTS = 50;

function matches(device: BrowseDevice, query: string): boolean {
  return (
    (device.name ?? "").toLowerCase().includes(query) ||
    device.codename.toLowerCase().includes(query) ||
    (device.brand ?? "").toLowerCase().includes(query)
  );
}

export default function DeviceSearch({ devices }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const { results, total } = useMemo(() => {
    if (needle === "") return { results: [], total: 0 };
    const all = devices.filter((device) => matches(device, needle));
    return { results: all.slice(0, MAX_RESULTS), total: all.length };
  }, [devices, needle]);

  return (
    <Command shouldFilter={false} className="rounded-xl border border-border/60">
      <CommandInput
        aria-label="Search devices"
        placeholder="Search by device name, codename, or brand…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[22rem]">
        {needle !== "" && total === 0 && (
          <CommandEmpty>No devices found.</CommandEmpty>
        )}
        <CommandGroup>
          {results.map((device) => (
            <CommandItem
              key={device.codename}
              value={device.codename}
              onSelect={() => navigate(`/devices/${device.codename}`)}
              className="gap-3"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">
                  {device.name ?? device.codename}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {[device.brand, device.codename].filter(Boolean).join(" · ")}
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
        {total > results.length && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Showing {results.length} of {total} matches — refine your search.
          </div>
        )}
      </CommandList>
    </Command>
  );
}
