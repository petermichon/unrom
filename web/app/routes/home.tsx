import { useState } from "react";
import { Link, useLoaderData } from "react-router";
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
import type { RomSummary } from "@/lib/types";
import type { Route } from "./+types/home";

async function load() {
  const [summary, roms] = await Promise.all([
    fetchSummary(),
    fetchRomSummaries().catch(() => [] as RomSummary[]),
  ]);

  // The two ROMs the hero rotates through: the most-supported one, and the
  // privacy-focused one people look for by name.
  const slides = ["lineageos", "grapheneos", "eos"]
    .map((id) => roms.find((rom) => rom.id === id))
    .filter((rom): rom is RomSummary => rom !== undefined);

  return {
    counts: {
      devices: summary.deviceCount,
      brands: summary.brandCount,
      roms: summary.romCount,
      coveredRoms: summary.coveredRomCount,
    },
    topDevices: summary.topDevices,
    slides,
    roms: [...roms].sort((a, b) => b.deviceCount - a.deviceCount).slice(0, 8),
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const counts = loaderData?.counts;

  return [
    ...pageMeta({
      title: "Custom ROMs for your device, with sources | unrom",
      description: counts
        ? `Device-to-ROM compatibility for ${formatNumber(counts.devices)} devices, ${formatNumber(counts.brands)} brands and ${formatNumber(counts.roms)} custom ROMs (${formatNumber(counts.coveredRoms)} with device data). Every mapping links its source.`
        : "Device-to-ROM compatibility data, with the source behind every mapping.",
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
  const { counts, topDevices, slides, roms } = useLoaderData<typeof loader>();

  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex] ?? slides[0];

  const sections = [
    { to: "/devices", title: "Devices", count: counts.devices },
    { to: "/brands", title: "Brands", count: counts.brands },
    { to: "/roms", title: "ROMs", count: counts.roms },
  ];

  return (
    <section className="flex flex-col gap-16">
      <div
        data-motion
        data-rom={slide?.id}
        className="hero-panel relative overflow-hidden rounded-4xl bg-panel px-6 py-10 text-panel-foreground ring-1 ring-black/[0.03] transition-colors sm:px-10 sm:py-12 lg:px-12 lg:py-14 dark:ring-white/[0.06]"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-center xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 max-w-2xl flex-col gap-6">
            <h1 className="text-balance font-heading text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-[3.4rem]">
              Find the ROMs your device can run
            </h1>
            <p className="max-w-[46ch] text-lg leading-relaxed text-panel-foreground/75">
              Device-to-ROM mappings taken from each project's own build pages,
              with the source behind every one.
            </p>
            <div className="max-w-xl">
              <DeviceSearch examples={EXAMPLES} />
            </div>
            <p className="max-w-[52ch] text-sm leading-relaxed text-panel-foreground/70 tabular-nums">
              {formatNumber(counts.devices)} devices,{" "}
              {formatNumber(counts.brands)} brands and{" "}
              {formatNumber(counts.roms)} ROMs.{" "}
              {formatNumber(counts.coveredRoms)} of those ROMs have device data
              so far.
            </p>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>

        {slides.length > 0 && (
          <HeroIllustration
            slides={slides}
            index={slideIndex}
            onSelect={setSlideIndex}
          />
        )}
      </div>

      <section aria-labelledby="browse">
        <h2 id="browse" className="sr-only">
          Browse the database
        </h2>
        <ul className="grid divide-y divide-border overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {sections.map((section) => (
            <li key={section.to}>
              <Link
                to={section.to}
                prefetch="intent"
                className="flex items-baseline gap-3 px-4 py-3.5 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <span className="font-semibold">{section.title}</span>
                <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                  {formatNumber(section.count)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {roms.length > 0 && (
        <section aria-labelledby="browse-roms" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="browse-roms"
              className="font-heading text-xl font-bold tracking-tight"
            >
              Browse by ROM
            </h2>
            <Link
              to="/roms"
              prefetch="intent"
              className="text-sm font-semibold text-brand hover:underline"
            >
              All {formatNumber(counts.roms)} ROMs
            </Link>
          </div>
          <ul className="grid border-t border-border sm:grid-cols-2 sm:gap-x-8">
            {roms.map((rom) => (
              <li key={rom.id}>
                <Link
                  to={`/roms/${rom.id}`}
                  prefetch="intent"
                  className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 outline-none hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="truncate font-medium">{rom.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatNumber(rom.deviceCount)}{" "}
                    {rom.deviceCount === 1 ? "device" : "devices"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="top-devices" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="top-devices"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Devices with the most ROMs
          </h2>
          <Link
            to="/devices"
            prefetch="intent"
            className="text-sm font-semibold text-brand hover:underline"
          >
            All devices
          </Link>
        </div>
        <ul className="index-frame">
          {topDevices.map((device) => (
            <li key={`${device.vendor}/${device.codename}`}>
              <Link
                to={`/devices/${device.vendor}/${device.codename}`}
                prefetch="intent"
                className="index-row"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">
                    {deviceName(device)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {device.vendorName}{" "}
                    <span className="font-mono">({device.codename})</span>
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {device.roms.length}{" "}
                  {device.roms.length === 1 ? "ROM" : "ROMs"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="provenance"
        className="flex flex-col gap-4 border-t border-border pt-8"
      >
        <h2
          id="provenance"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Where this data comes from
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold">Each mapping links its source</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every device–ROM pair points at the page that reports it. A
              reference marked generated was built from the codename and is not
              evidence that a build exists.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold">Confidence is labelled</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Curated device names carry a confidence: verified, inferred,
              manual or unverified. Device pages show which one applies and
              which ROMs back it.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-semibold">Take the data with you</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The whole dataset downloads as JSON or SQLite, and every page is
              the same data behind a REST API. See the{" "}
              <Link
                to="/data"
                prefetch="intent"
                className="font-medium text-brand hover:underline"
              >
                data page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}

/**
 * The hero visual: a phone running a custom ROM, not a screenshot of unrom.
 *
 * Two slides — the most-supported ROM and the privacy-focused one people ask
 * for by name — switch manually; nothing advances on its own. The phone itself
 * is decorative and hidden from assistive tech, while the buttons and the live
 * status are real controls.
 */
function HeroIllustration({
  slides,
  index,
  onSelect,
}: {
  slides: RomSummary[];
  index: number;
  onSelect: (position: number) => void;
}) {
  const slide = slides[index] ?? slides[0];

  return (
    <div className="pointer-events-none absolute right-8 -bottom-12 hidden lg:block xl:right-12">
      <div className="relative w-[14.5rem]">
        <HeroDevice slides={slides} index={index} />

        {slides.length > 1 && (
          <div className="pointer-events-auto absolute bottom-16 -left-20 flex items-center gap-1">
            {slides.map((rom, position) => (
              <button
                key={rom.id}
                type="button"
                onClick={() => onSelect(position)}
                aria-label={`Show ${rom.name}`}
                aria-current={position === index ? "true" : undefined}
                className="flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span
                  data-motion
                  className={`size-2 rounded-full transition-colors ${
                    position === index
                      ? "bg-panel-foreground/90"
                      : "bg-panel-foreground/40 hover:bg-panel-foreground/60"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        <span role="status" aria-live="polite" className="sr-only">
          {slide.name}
        </span>
      </div>
    </div>
  );
}

/** White marks for the ROMs the carousel shows, from their own projects. */
const ROM_LOGOS: Record<string, string> = {
  lineageos: "/brand/lineageos.png",
  grapheneos: "/brand/grapheneos.svg",
  eos: "/brand/eos.png",
};

/**
 * Device geometry, not a UI surface, so the radii and shadow sit outside the
 * interface's shape scale.
 */
function HeroDevice({
  slides,
  index,
}: {
  slides: RomSummary[];
  index: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="relative w-[14.5rem] shrink-0 select-none"
    >
      <span className="absolute -bottom-5 left-1/2 h-10 w-[82%] -translate-x-1/2 rounded-full bg-black/20 blur-xl dark:bg-black/70" />

      <div className="relative flex h-[30rem] w-full flex-col overflow-hidden rounded-4xl bg-[#101318] p-[6px] shadow-[0_28px_50px_-28px_rgba(13,16,36,0.55)] ring-1 ring-black/15 dark:bg-[#0b0e15] dark:ring-white/20">
        <span className="absolute top-20 -left-px h-8 w-[2px] rounded-l-full bg-white/25" />
        <span className="absolute top-32 -left-px h-12 w-[2px] rounded-l-full bg-white/25" />
        <span className="absolute top-24 -right-px h-14 w-[2px] rounded-r-full bg-white/25" />

        <div className="relative h-full overflow-hidden rounded-3xl bg-[#06080e] text-white">
          {slides.map((rom, position) => (
            <div
              key={rom.id}
              data-motion
              className={`absolute inset-0 flex flex-col items-center justify-center gap-6 pb-12 transition-opacity ${
                position === index ? "opacity-100" : "opacity-0"
              }`}
            >
              {ROM_LOGOS[rom.id] && (
                <img src={ROM_LOGOS[rom.id]} alt="" className="h-10 w-auto" />
              )}
              <span className="font-heading text-[26px] leading-none font-bold tracking-[-0.03em]">
                {rom.name}
              </span>
              <span className="h-[3px] w-28 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full w-10 rounded-full bg-[var(--hero-accent)]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
