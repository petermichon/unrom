import { Link } from "react-router";
import { deviceName } from "@/lib/devices";
import type { BrowseDevice, DeviceMatch } from "@/lib/types";

interface Props {
  device: BrowseDevice;
  /** Hide the brand line when the page is already scoped to one brand. */
  showBrand?: boolean;
}

export default function DeviceRow({ device, showBrand = true }: Props) {
  const count = device.roms.length;
  return (
    <div className="flex flex-col">
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
      {device.match.length > 0 && (
        <div className="-mt-1 flex flex-col gap-1 px-3 pb-3">
          {device.match.map((match) => (
            <MatchLine key={`${match.filter}-${match.romId}`} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Why the row is in this filtered list, in the terms the filter uses, with the
 * pages that state each fact. Rendered outside the row link so the sources can
 * be links of their own.
 */
function MatchLine({ match }: { match: DeviceMatch }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/80">{match.romName}</span>
      {match.facts.length > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>{match.facts.join(", ")}</span>
        </>
      )}
      {match.sources.length > 0 && (
        <span>
          (<span className="sr-only">Sources: </span>
          {match.sources.map((source, index) => (
            <span key={source.url}>
              {index > 0 && ", "}
              <a
                href={source.url}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {source.label}
              </a>
            </span>
          ))}
          )
        </span>
      )}
    </p>
  );
}
