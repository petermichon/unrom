import { useMemo, useState } from "react";
import { Link } from "react-router";
import { SearchInput } from "@/components/SearchInput";
import { deviceHaystack, matchesAll, tokenize } from "@/lib/search";
import { byDirectoryName } from "@/lib/sort";
import type { BrowseDevice } from "@/lib/types";

interface Props {
  devices: BrowseDevice[];
}

interface LetterGroup {
  letter: string;
  devices: BrowseDevice[];
}

const displayName = (device: BrowseDevice) => device.name ?? device.codename;

function firstLetter(name: string): string {
  const key = name.replace(/^[^\p{L}\p{N}]+/u, "");
  const first = key.charAt(0);
  return /^\p{L}/u.test(first) ? first.toUpperCase() : "#";
}

function groupByLetter(devices: BrowseDevice[]): LetterGroup[] {
  const groups: LetterGroup[] = [];
  const index = new Map<string, LetterGroup>();
  for (const device of devices) {
    const letter = firstLetter(displayName(device));
    let group = index.get(letter);
    if (!group) {
      group = { letter, devices: [] };
      index.set(letter, group);
      groups.push(group);
    }
    group.devices.push(device);
  }
  return groups;
}

function DeviceRow({ device }: { device: BrowseDevice }) {
  const count = device.roms.length;
  return (
    <Link
      to={`/devices/${device.vendor}/${device.codename}`}
      prefetch="intent"
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{displayName(device)}</span>
        <span className="truncate text-xs text-muted-foreground">
          {device.vendorName} ·{" "}
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

export default function DevicesDirectory({ devices }: Props) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [zeroOpen, setZeroOpen] = useState(false);

  const brands = useMemo(() => {
    const map = new Map<string, string>();
    for (const device of devices) map.set(device.vendor, device.vendorName);
    return [...map.entries()].sort((a, b) => byDirectoryName(a[1], b[1]));
  }, [devices]);

  const filtered = useMemo(() => {
    const terms = tokenize(query);
    return devices
      .filter(
        (device) =>
          (!brand || device.vendor === brand) &&
          (terms.length === 0 || matchesAll(deviceHaystack(device), terms)),
      )
      .sort((a, b) => byDirectoryName(displayName(a), displayName(b)));
  }, [devices, query, brand]);

  const withData = useMemo(
    () => filtered.filter((device) => device.roms.length > 0),
    [filtered],
  );
  const withoutData = useMemo(
    () => filtered.filter((device) => device.roms.length === 0),
    [filtered],
  );
  const groups = useMemo(() => groupByLetter(withData), [withData]);

  const filtering = query.trim().length > 0 || brand !== "";
  const zeroIsOpen = zeroOpen || (filtering && withoutData.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          id="devices-search"
          value={query}
          onValueChange={setQuery}
          placeholder="Filter by device, codename, or brand…"
          ariaLabel="Filter devices"
          className="max-w-md"
        />
        <select
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          aria-label="Filter by brand"
          className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-52"
        >
          <option value="">All brands</option>
          {brands.map(([vendor, name]) => (
            <option key={vendor} value={vendor}>
              {name}
            </option>
          ))}
        </select>
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {filtered.length} of {devices.length} devices
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No devices match.
        </p>
      ) : (
        <>
          {groups.length > 1 && (
            <nav aria-label="Device letters" className="flex flex-wrap gap-1">
              {groups.map((group) => (
                <a
                  key={group.letter}
                  href={`#devices-${group.letter}`}
                  className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {group.letter}
                </a>
              ))}
            </nav>
          )}

          {groups.map((group) => (
            <section
              key={group.letter}
              aria-labelledby={`devices-${group.letter}`}
              className="scroll-mt-20"
            >
              <h2
                id={`devices-${group.letter}`}
                className="mb-1 font-heading text-sm font-semibold text-muted-foreground"
              >
                {group.letter}
              </h2>
              <ul className="flex flex-col">
                {group.devices.map((device) => (
                  <li key={`${device.vendor}/${device.codename}`}>
                    <DeviceRow device={device} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {withoutData.length > 0 && (
            <details
              open={zeroIsOpen}
              onToggle={(event) => setZeroOpen(event.currentTarget.open)}
              className="rounded-xl border border-border/60"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                No ROM data yet — {withoutData.length}{" "}
                {withoutData.length === 1 ? "device" : "devices"}
              </summary>
              <ul className="flex flex-col px-2 pb-2">
                {withoutData.map((device) => (
                  <li key={`${device.vendor}/${device.codename}`}>
                    <DeviceRow device={device} />
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
