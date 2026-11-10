import { Link } from "react-router";
import { deviceName } from "@/lib/devices";
import type { BrowseDevice } from "@/lib/types";

interface Props {
  device: BrowseDevice;
}

export default function DeviceCard({ device }: Props) {
  const count = device.roms.length;
  return (
    <Link
      to={`/devices/${device.vendor}/${device.codename}`}
      prefetch="intent"
      className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-5 outline-none transition-colors hover:border-brand/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-heading text-lg font-bold tracking-[-0.01em]">
          {deviceName(device)}
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {device.vendorName} ·{" "}
          <span className="font-mono text-xs">{device.codename}</span>
        </span>
      </span>
      <span className="w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground tabular-nums">
        {count} {count === 1 ? "ROM" : "ROMs"}
      </span>
    </Link>
  );
}
