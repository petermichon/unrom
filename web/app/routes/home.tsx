import { useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import DeviceRow from "@/components/DeviceRow";
import DeviceSearch from "@/components/DeviceSearch";
import { fetchSummary } from "@/lib/data";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/home";

async function load() {
  const summary = await fetchSummary();
  return {
    counts: {
      devices: summary.deviceCount,
      brands: summary.brandCount,
      roms: summary.romCount,
      coveredRoms: summary.coveredRomCount,
    },
    topDevices: summary.topDevices,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const counts = loaderData?.counts;

  return [
    ...pageMeta({
      title: "Find the custom ROMs that support your device | unrom",
      description: counts
        ? `The open database for device–ROM compatibility: ${formatNumber(counts.devices)} devices, ${formatNumber(counts.brands)} brands and ${formatNumber(counts.roms)} custom ROMs (${formatNumber(counts.coveredRoms)} with device data). Search by device, codename, brand, or ROM.`
        : "The open database for device–ROM compatibility.",
      path: "/",
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
  ];
};

export async function loader() {
  return load();
}

// The summary is small and cached client-side; search itself is server-side.
export async function clientLoader() {
  return load();
}

const EXAMPLES = ["Pixel 9", "beryllium", "Xiaomi", "LineageOS"];

export default function Home() {
  const { counts, topDevices } = useLoaderData<typeof loader>();

  const sections = useMemo(
    () => [
      {
        to: "/devices",
        title: "Devices",
        count: counts.devices,
        note: "A–Z directory",
      },
      {
        to: "/brands",
        title: "Brands",
        count: counts.brands,
        note: "Ranked by ROM coverage",
      },
      {
        to: "/roms",
        title: "ROMs",
        count: counts.roms,
        note: `${counts.coveredRoms} with device data`,
      },
    ],
    [counts],
  );

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
          Tracking{" "}
          <span className="text-foreground">
            {formatNumber(counts.devices)}
          </span>{" "}
          devices across{" "}
          <span className="text-foreground">{formatNumber(counts.brands)}</span>{" "}
          brands and{" "}
          <span className="text-foreground">{formatNumber(counts.roms)}</span>{" "}
          ROMs —{" "}
          <span className="text-foreground">
            {formatNumber(counts.coveredRoms)}
          </span>{" "}
          with device data.
        </p>
      </div>

      <DeviceSearch examples={EXAMPLES} />

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
                {formatNumber(section.count)}
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
