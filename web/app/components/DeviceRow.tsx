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
      className="device-row"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{deviceName(device)}</span>
        <span className="truncate text-xs text-muted-foreground">
          {showBrand && <span className="mr-1.5">{device.vendorName}</span>}
          <span className="font-mono">({device.codename})</span>
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {count} {count === 1 ? "ROM" : "ROMs"}
      </span>
    </Link>
  );
}
