import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import DeviceCard from "@/components/DeviceCard";
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

const EXAMPLES = ["Pixel", "sweet", "LineageOS"];

export default function Home() {
  const { counts, topDevices } = useLoaderData<typeof loader>();

  const sections = useMemo(
    () => [
      {
        to: "/devices",
        title: "Devices",
        count: counts.devices,
        note: "Search and filter every device",
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
        note: `${formatNumber(counts.coveredRoms)} with device data`,
      },
    ],
    [counts],
  );

  return (
    <section className="flex flex-col gap-12">
      <div className="rounded-[2rem] bg-panel px-6 py-10 text-panel-foreground ring-1 ring-black/[0.03] sm:px-10 sm:py-12 lg:px-14 lg:py-14 dark:ring-white/[0.06]">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex max-w-3xl flex-col gap-6">
            <h1 className="text-balance font-heading text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-[3rem] xl:text-[3.25rem]">
              Find the custom ROMs that support your device
            </h1>
            <p className="max-w-[52ch] text-lg leading-relaxed text-panel-foreground/75">
              The open database for device–ROM compatibility, with the source
              behind each mapping.
            </p>
            <div className="max-w-2xl">
              <DeviceSearch examples={EXAMPLES} />
            </div>
          </div>

          <PhoneIllustration />
        </div>
      </div>

      <section aria-labelledby="browse">
        <h2 id="browse" className="sr-only">
          Browse the database
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <li key={section.to}>
              <Link
                to={section.to}
                prefetch="intent"
                className="flex h-full flex-col gap-1 rounded-2xl border border-border bg-card p-5 outline-none transition-colors hover:border-brand/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="text-sm font-semibold text-brand dark:text-muted-foreground">
                  {section.title}
                </span>
                <span className="mt-1 font-heading text-3xl font-extrabold tracking-[-0.02em] tabular-nums">
                  {formatNumber(section.count)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {section.note}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="top-devices" className="flex flex-col gap-4">
        <h2
          id="top-devices"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Devices with the most ROMs
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topDevices.map((device) => (
            <li key={`${device.vendor}/${device.codename}`}>
              <DeviceCard device={device} />
            </li>
          ))}
        </ul>
        <Link
          to="/devices"
          prefetch="intent"
          className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand hover:underline"
        >
          Browse all devices
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <p className="max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
        Every device page lists its supported ROMs with the source behind each
        one; the full dataset is available as JSON, SQLite, and a REST API — see
        the{" "}
        <Link
          to="/data"
          prefetch="intent"
          className="font-medium text-brand hover:underline"
        >
          data page
        </Link>
        .
      </p>
    </section>
  );
}

/** Decorative device shot for the hero: no data, no link, no focus target. */
function PhoneIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto hidden w-[14rem] shrink-0 select-none lg:block"
    >
      <span className="absolute -inset-4 rounded-[3rem] bg-transparent blur-2xl dark:bg-[#4a5bd8]/15" />
      <span className="absolute inset-x-6 -bottom-4 h-8 rounded-[100%] bg-black/25 blur-2xl dark:bg-black/70" />
      <span className="absolute -left-[3px] top-24 h-9 w-[3px] rounded-l-full bg-white/20" />
      <span className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-full bg-white/20" />
      <span className="absolute -right-[3px] top-28 h-16 w-[3px] rounded-r-full bg-white/20" />

      <span className="relative flex h-[27rem] w-full flex-col overflow-hidden rounded-[2.5rem] bg-[#1d2740] p-[6px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-black/15 dark:bg-[#0c0f18] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)] dark:ring-white/25">
        <span className="relative flex h-full flex-col overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#eef2ff] via-[#dde4fb] to-[#9aa8ff] dark:from-[#3d4a73] dark:via-[#232b45] dark:to-[#121722]">
          <span className="absolute inset-0 bg-gradient-to-b from-[#eef2ff] via-[#dde4fb] to-[#9aa8ff] dark:from-[#3d4a73] dark:via-[#232b45] dark:to-[#121722]" />
          <span className="absolute -top-20 -right-16 size-64 rounded-full bg-[#f3f5ff] opacity-80 blur-3xl dark:bg-[#6d7cff] dark:opacity-70" />
          <span className="absolute top-24 -left-20 size-64 rounded-full bg-[#a9b6ff] opacity-50 blur-3xl dark:bg-[#a9b6ff] dark:opacity-35" />
          <span className="absolute -bottom-24 left-0 size-64 rounded-full bg-[#8d9cff] opacity-40 blur-3xl dark:bg-[#1a1d27] dark:opacity-90" />
          <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 dark:via-white/[0.04] dark:to-white/15" />
          <span className="absolute top-2.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#1d2740] ring-1 ring-white/20 dark:bg-[#0a0b11]" />
        </span>
      </span>
    </div>
  );
}
