import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import DeviceCard from "@/components/DeviceCard";
import DeviceSearch from "@/components/DeviceSearch";
import { fetchRomSummaries, fetchSummary } from "@/lib/data";
import { deviceName } from "@/lib/devices";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { BrowseDevice, RomChip } from "@/lib/types";
import type { Route } from "./+types/home";

async function load() {
  const [summary, roms] = await Promise.all([
    fetchSummary(),
    fetchRomSummaries(),
  ]);
  return {
    counts: {
      devices: summary.deviceCount,
      brands: summary.brandCount,
      roms: summary.romCount,
      coveredRoms: summary.coveredRomCount,
    },
    topDevices: summary.topDevices,
    romCounts: Object.fromEntries(
      roms.map((rom) => [rom.id, rom.deviceCount]),
    ) as Record<string, number>,
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

const EXAMPLES = ["Pixel", "beryllium", "Xiaomi", "LineageOS"];

export default function Home() {
  const { counts, topDevices, romCounts } = useLoaderData<typeof loader>();

  const featured = topDevices[0];
  const featuredRoms = useMemo(
    () =>
      featured
        ? [...featured.roms].sort(
            (a, b) =>
              (romCounts[b.id] ?? 0) - (romCounts[a.id] ?? 0) ||
              a.name.localeCompare(b.name),
          )
        : [],
    [featured, romCounts],
  );

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
      <div className="rounded-[2rem] bg-panel px-6 py-10 text-panel-foreground sm:px-10 sm:py-12 lg:px-14 lg:py-14">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex max-w-3xl flex-col gap-6">
            <h1 className="text-balance font-heading text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-[3rem] xl:text-[3.25rem]">
              Find the custom ROMs that support your device
            </h1>
            <p className="max-w-[52ch] text-lg leading-relaxed text-panel-foreground/75">
              The open database for device–ROM compatibility. Search by device
              name, codename, brand, or ROM to see what supports it.
            </p>
            <div className="max-w-2xl">
              <DeviceSearch examples={EXAMPLES} />
            </div>
          </div>

          {featured && <FeaturedDevice device={featured} roms={featuredRoms} />}
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

/**
 * The most supported device, presented as a phone rather than another card.
 * The frame is decoration; the screen is real device and ROM data.
 */
function FeaturedDevice({
  device,
  roms,
}: {
  device: BrowseDevice;
  roms: RomChip[];
}) {
  return (
    <>
      <Link
        to={`/devices/${device.vendor}/${device.codename}`}
        prefetch="intent"
        className="flex flex-col gap-3 rounded-2xl bg-background p-5 text-foreground shadow-lg ring-1 ring-black/5 outline-none hover:ring-ring/40 focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden dark:bg-card dark:ring-white/10"
      >
        <span className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-brand dark:text-muted-foreground">
            Most supported device
          </span>
          <span className="font-heading text-xl font-extrabold tracking-[-0.02em]">
            {deviceName(device)}
          </span>
          <span className="text-sm text-muted-foreground">
            {device.vendorName} ·{" "}
            <span className="font-mono text-xs">{device.codename}</span>
          </span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {roms
            .slice(0, 3)
            .map((rom) => rom.name)
            .join(" · ")}
          {roms.length > 3 ? ` · +${roms.length - 3} more` : ""}
        </span>
        <span className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold">{roms.length} ROMs</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-brand">
            See all <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </span>
      </Link>

      <Link
        to={`/devices/${device.vendor}/${device.codename}`}
        prefetch="intent"
        aria-label={`Most supported device: ${deviceName(device)}, ${roms.length} ROMs`}
        className="group relative mx-auto hidden w-[14.5rem] shrink-0 outline-none lg:block"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-5 -bottom-3 h-8 rounded-[100%] bg-black/25 blur-2xl dark:bg-black/60"
        />
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-24 h-9 w-[3px] rounded-l-full bg-white/20"
        />
        <span
          aria-hidden="true"
          className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-full bg-white/20"
        />
        <span
          aria-hidden="true"
          className="absolute -right-[3px] top-28 h-16 w-[3px] rounded-r-full bg-white/20"
        />

        <span className="relative flex h-[29rem] flex-col overflow-hidden rounded-[2.5rem] bg-[#101011] p-[6px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-black/10 group-hover:ring-ring/50 group-focus-visible:ring-3 group-focus-visible:ring-ring/60 dark:bg-[#050506] dark:ring-white/15">
          <span className="relative flex h-full flex-col overflow-hidden rounded-[2.1rem] bg-white text-[#0d0d0f] dark:bg-[#1d1d1d] dark:text-[#f0f0f0]">
            <span
              aria-hidden="true"
              className="absolute top-2 left-1/2 z-10 h-[18px] w-[68px] -translate-x-1/2 rounded-full bg-[#101011] ring-1 ring-white/10 dark:bg-[#050506]"
            />

            <span className="flex flex-col gap-1 px-4 pt-9">
              <span className="text-[10px] font-semibold text-brand dark:text-muted-foreground">
                Most supported device
              </span>
              <span className="line-clamp-2 font-heading text-lg leading-tight font-extrabold tracking-[-0.02em]">
                {deviceName(device)}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {device.vendorName} ·{" "}
                <span className="font-mono">{device.codename}</span>
              </span>
            </span>

            <span className="mx-4 mt-4 flex items-baseline gap-1.5 border-t border-border pt-3">
              <span className="font-heading text-2xl font-extrabold tabular-nums">
                {roms.length}
              </span>
              <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                ROMs
              </span>
            </span>

            <span className="mt-2 flex flex-col gap-1 px-3">
              {roms.slice(0, 6).map((rom) => (
                <span
                  key={rom.id}
                  className="flex items-center gap-2 rounded-lg bg-muted/70 px-2 py-1.5"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white font-mono text-[9px] font-bold text-muted-foreground dark:bg-[#2a2a2a]">
                    {rom.name.charAt(0)}
                  </span>
                  <span className="truncate text-[11px] font-medium">
                    {rom.name}
                  </span>
                </span>
              ))}
              {roms.length > 6 && (
                <span className="px-2 pt-0.5 text-[10px] text-muted-foreground">
                  +{roms.length - 6} more
                </span>
              )}
            </span>

            <span className="mt-auto flex items-center justify-between border-t border-border px-4 py-3 text-xs font-semibold text-brand">
              See all {roms.length} ROMs
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </span>
        </span>
      </Link>
    </>
  );
}
