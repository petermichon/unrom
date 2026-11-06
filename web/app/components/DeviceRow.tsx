import { Link } from "react-router";
import { deviceName } from "@/lib/devices";
import type { BrowseDevice } from "@/lib/types";

interface Props {
  device: BrowseDevice;
  /** Hide the brand line when the page is already scoped to one brand. */
  showBrand?: boolean;
}

export default function DeviceRow({ device, showBrand = true }: Props) {
  const count = device.roms.length;
  return (
    <Link
      to={`/devices/${device.vendor}/${device.codename}`}
      prefetch="intent"
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{deviceName(device)}</span>
        <span className="truncate text-xs text-muted-foreground">
          {showBrand && <>{device.vendorName} · </>}
          <span className="font-mono">{device.codename}</span>
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {count === 0
          ? "No ROM data"
          : `${count} ${count === 1 ? "ROM" : "ROMs"}`}
      </span>
    </Link>
  );
}
