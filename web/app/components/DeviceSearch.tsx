import { useState } from "react";
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
import type { DeviceDetail } from "@/lib/types";

interface Props {
  devices: DeviceDetail[];
}

export default function DeviceSearch({ devices }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <Command
      className="rounded-xl border border-border/60"
      value={query}
      onValueChange={setQuery}
    >
      <CommandInput placeholder="Search by device name, codename, or brand…" />
      <CommandList className="max-h-[22rem]">
        {query.trim() !== "" && (
          <CommandEmpty>No devices found.</CommandEmpty>
        )}
        <CommandGroup>
          {devices.map((device) => (
            <CommandItem
              key={device.codename}
              value={`${device.name ?? ""} ${device.codename} ${
                device.brand ?? ""
              }`}
              onSelect={() => navigate(`/device/${device.codename}`)}
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
      </CommandList>
    </Command>
  );
}
