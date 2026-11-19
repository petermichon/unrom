import DeviceRow from "@/components/DeviceRow";
import type { BrowseDevice } from "@/lib/types";

/**
 * The directory's device list: one framed surface with a single row of column
 * labels, so the ROM count is stated once at the top instead of 50 times.
 */
export default function DeviceDirectoryList({
  devices,
  showBrand = true,
}: {
  devices: BrowseDevice[];
  showBrand?: boolean;
}) {
  return (
    <div className="index-frame">
      <div
        aria-hidden="true"
        className="flex items-center justify-between px-4 py-2 text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        <span>Device</span>
        <span>ROMs</span>
      </div>
      <ul className="divide-y divide-border">
        {devices.map((device) => (
          <li key={`${device.vendor}/${device.codename}`}>
            <DeviceRow device={device} showBrand={showBrand} />
          </li>
        ))}
      </ul>
    </div>
  );
}
