import { useEffect, useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import DeviceRow from "@/components/DeviceRow";
import DeviceSearch from "@/components/DeviceSearch";
import { fetchDevices, fetchRoms, seedDevices } from "@/lib/data";
import { deviceName } from "@/lib/devices";
import type { RomSearchEntry } from "@/lib/search";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { bySortKey } from "@/lib/sort";
import type { RomDetail } from "@/lib/types";
import type { Route } from "./+types/home";

function toRomSearchEntry(rom: RomDetail): RomSearchEntry {
  return {
    id: rom.id,
    name: rom.name,
    deviceCount: rom.deviceCount,
    haystack: [
      rom.name,
      ...rom.devices.flatMap((device) => [device.name ?? "", device.codename]),
    ]
      .join(" ")
      .toLowerCase(),
  };
}

async function load() {
  const [devices, roms] = await Promise.all([fetchDevices(), fetchRoms()]);
  return {
    devices,
    roms: [...roms]
      .sort(
        (a, b) => b.deviceCount - a.deviceCount || bySortKey(a.name, b.name),
      )
      .map(toRomSearchEntry),
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const devices = loaderData?.devices ?? [];
  const roms = loaderData?.roms ?? [];
  const brands = new Set(devices.map((device) => device.vendor)).size;
  const covered = roms.filter((rom) => rom.deviceCount > 0).length;
  return [
    ...pageMeta({
      title: "Find the custom ROMs that support your device | unrom",
      description: `The open database for device–ROM compatibility: ${devices.length} devices, ${brands} brands and ${roms.length} custom ROMs (${covered} with device data) Search by device, codename, brand, or ROM.`,
      path: "/",
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
  ];
};

export async function loader() {
  return load();
}

// Same data as the server loader, but read from the client-side cache on
// navigation so transitions never hit the network again.
export async function clientLoader() {
  return load();
}

const EXAMPLES = ["Pixel 9", "beryllium", "Xiaomi", "LineageOS"];

export default function Home() {
  const { devices, roms } = useLoaderData<typeof loader>();

  useEffect(() => {
    seedDevices(devices);
  }, [devices]);

  const brands = useMemo(
    () => new Set(devices.map((device) => device.vendor)).size,
    [devices],
  );
  const covered = useMemo(
    () => roms.filter((rom) => rom.deviceCount > 0).length,
    [roms],
  );
  const topDevices = useMemo(
    () =>
      [...devices]
        .sort(
          (a, b) =>
            b.roms.length - a.roms.length ||
            bySortKey(deviceName(a), deviceName(b)),
        )
        .slice(0, 6),
    [devices],
  );

  const sections = [
    {
      to: "/devices",
      title: "Devices",
      count: devices.length,
      note: "A–Z directory",
    },
    {
      to: "/brands",
      title: "Brands",
      count: brands,
      note: "Ranked by ROM coverage",
    },
    {
      to: "/roms",
      title: "ROMs",
      count: roms.length,
      note: `${covered} with device data`,
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
          Find the custom ROMs that support your device
        </h1>
        <p className="text-muted-foreground">
          The open database for device–ROM compatibility. Search by device name,
          codename, brand, or ROM to see what supports it.
        </p>
        <p className="text-sm text-muted-foreground">
          Tracking <span className="text-foreground">{devices.length}</span>{" "}
          devices across <span className="text-foreground">{brands}</span>{" "}
          brands and <span className="text-foreground">{roms.length}</span> ROMs
          — <span className="text-foreground">{covered}</span> with device data.
        </p>
      </div>

      <DeviceSearch devices={devices} roms={roms} examples={EXAMPLES} />

      <ul className="grid gap-3 sm:grid-cols-3">
        {sections.map((section) => (
          <li key={section.to}>
            <Link
              to={section.to}
              prefetch="intent"
              className="flex h-full flex-col gap-1 rounded-xl border border-border/60 p-4 outline-none transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="font-heading text-base font-semibold">
                {section.title}
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                {section.count.toLocaleString("en-US")}
              </span>
              <span className="text-xs text-muted-foreground">
                {section.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="top-devices" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2
            id="top-devices"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Devices with the most ROMs
          </h2>
          <span className="text-xs text-muted-foreground">by ROM count</span>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2">
          {topDevices.map((device) => (
            <li key={`${device.vendor}/${device.codename}`}>
              <DeviceRow device={device} />
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted-foreground">
        Data:{" "}
        <a
          href="/api/devices"
          className="font-mono text-foreground/80 hover:text-foreground hover:underline"
        >
          GET /api/devices
        </a>{" "}
        ·{" "}
        <a
          href="/api/export/json"
          className="hover:text-foreground hover:underline"
        >
          JSON
        </a>{" "}
        ·{" "}
        <a
          href="/api/export/sqlite"
          className="hover:text-foreground hover:underline"
        >
          SQLite
        </a>{" "}
        ·{" "}
        <a
          href="https://opendatacommons.org/licenses/odbl/1-0/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground hover:underline"
        >
          ODbL
        </a>
      </p>
    </section>
  );
}
