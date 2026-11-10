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
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Find the custom ROMs that support your device
        </h1>
        <p className="max-w-[68ch] text-muted-foreground">
          The open database for device–ROM compatibility. Search by device name,
          codename, brand, or ROM to see what supports it.
        </p>
      </div>

      <DeviceSearch examples={EXAMPLES} />

      <section aria-labelledby="browse" className="flex flex-col gap-3">
        <h2
          id="browse"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Browse the database
        </h2>
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
          {sections.map((section) => (
            <li key={section.to}>
              <Link to={section.to} prefetch="intent" className="index-row">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {section.note}
                  </span>
                </span>
                <span className="shrink-0 text-lg font-semibold tabular-nums">
                  {formatNumber(section.count)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="max-w-[68ch] text-sm text-muted-foreground">
          Each device page lists every custom ROM with a known build, the
          codename, and the source behind it. The dataset is rebuilt from
          upstream device lists and refreshed regularly. It is available as
          JSON, SQLite, and a REST API; see the{" "}
          <Link
            to="/data"
            prefetch="intent"
            className="text-foreground hover:underline"
          >
            data page
          </Link>
          .
        </p>
      </section>

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
    </section>
  );
}
