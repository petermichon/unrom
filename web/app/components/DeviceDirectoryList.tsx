import { Link } from "react-router";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import DeviceRow from "@/components/DeviceRow";
import type { BrowseDevice } from "@/lib/types";

/**
 * The directory's device list: one framed surface with a single row of column
 * labels, so the ROM count is stated once at the top instead of 50 times.
 * When the caller can offer sorting, the labels are the control.
 */
export default function DeviceDirectoryList({
  devices,
  showBrand = true,
  sort,
  nameHref,
  romsHref,
}: {
  devices: BrowseDevice[];
  showBrand?: boolean;
  sort?: "roms" | "name";
  nameHref?: string;
  romsHref?: string;
}) {
  const label = (text: string) => (
    <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase">
      {text}
    </span>
  );

  const sortable = (
    text: string,
    href: string | undefined,
    active: boolean,
    description: string,
  ) =>
    href ? (
      <Link
        to={href}
        prefetch="intent"
        aria-current={active ? "page" : undefined}
        className="group inline-flex items-center gap-1 rounded-sm text-[0.7rem] font-semibold tracking-[0.08em] uppercase outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {text}
        {active ? (
          sort === "name" ? (
            <ArrowUp aria-hidden="true" className="size-3" strokeWidth={2.5} />
          ) : (
            <ArrowDown
              aria-hidden="true"
              className="size-3"
              strokeWidth={2.5}
            />
          )
        ) : (
          <ArrowUpDown
            aria-hidden="true"
            className="size-3 text-muted-foreground/60 transition-colors group-hover:text-foreground"
            strokeWidth={2.5}
          />
        )}
        <span className="sr-only">
          {active ? `, sorted by ${description}` : `, sort by ${description}`}
        </span>
      </Link>
    ) : (
      label(text)
    );

  return (
    <div className="index-frame">
      <div className="flex items-center justify-between px-3 py-2 text-muted-foreground">
        {sortable("Device", nameHref, sort === "name", "name")}
        {sortable("ROMs", romsHref, sort === "roms", "ROM count")}
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
