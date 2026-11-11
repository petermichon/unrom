import { useEffect, useState } from "react";
import { ExternalLink, Pause, Play } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import DeviceSearch from "@/components/DeviceSearch";
import { RomPhone } from "@/components/RomPhone";
import { fetchDevice, fetchRomSummaries, fetchSummary } from "@/lib/data";
import { deviceName } from "@/lib/devices";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { referenceLabel } from "@/lib/sort";
import { useMediaQuery } from "@/lib/use-media-query";
import { formatNumber } from "@/lib/utils";
import type { DeviceDetail, RomSummary } from "@/lib/types";
import type { Route } from "./+types/home";

async function load() {
  const [summary, roms] = await Promise.all([
    fetchSummary(),
    fetchRomSummaries().catch(() => [] as RomSummary[]),
  ]);

  const rankedRoms = [...roms].sort((a, b) => b.deviceCount - a.deviceCount);
  const romCounts = new Map(rankedRoms.map((rom) => [rom.id, rom.deviceCount]));

  // The two ROMs the hero rotates through: the most-supported one, and the
  // privacy-focused one people look for by name.
  const slides = ["lineageos", "grapheneos", "eos"]
    .map((id) => roms.find((rom) => rom.id === id))
    .filter((rom): rom is RomSummary => rom !== undefined);

  // The summary only carries ROM ids, so the example needs one detail request
  // to show the reference behind each ROM. A failure must not take the page
  // down; without it the example block is simply omitted.
  const featured = summary.topDevices[0] ?? null;
  const example = featured
    ? await fetchDevice(featured.vendor, featured.codename).catch(() => null)
    : null;

  // Lead the example with the ROMs people know, not the alphabetically first,
  // and don't let a branded variant (LineageOS for microG) take a second slot
  // from the plain project.
  const exampleRoms: DeviceDetail["roms"] = [];
  const shownNames: string[] = [];
  for (const rom of example
    ? [...example.roms].sort(
        (a, b) =>
          (romCounts.get(b.id) ?? 0) - (romCounts.get(a.id) ?? 0) ||
          a.name.localeCompare(b.name),
      )
    : []) {
    const name = rom.name.toLowerCase();
    if (shownNames.some((shown) => name.startsWith(shown))) continue;
    shownNames.push(name);
    exampleRoms.push(rom);
    if (exampleRoms.length === 3) break;
  }

  return {
    counts: {
      devices: summary.deviceCount,
      brands: summary.brandCount,
      roms: summary.romCount,
      coveredRoms: summary.coveredRomCount,
    },
    // The example already shows this device, so leave it out of the list.
    topDevices: summary.topDevices.filter(
      (device) =>
        !example ||
        device.vendor !== example.vendor ||
        device.codename !== example.codename,
    ),
    example,
    exampleRoms,
    slides,
    roms: rankedRoms.slice(0, 8),
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
  const { counts, topDevices, example, exampleRoms, slides, roms } =
    useLoaderData<typeof loader>();

  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex] ?? slides[0];

  // The palette covers the whole page, header included. The section carries it
  // server-side for first paint; this extends it to the document for the bar.
  useEffect(() => {
    if (!slide) return;
    const root = document.documentElement;
    const previous = root.dataset.rom;
    root.dataset.rom = slide.id;
    return () => {
      if (previous) root.dataset.rom = previous;
      else delete root.dataset.rom;
    };
  }, [slide]);

  return (
    <section data-rom={slide?.id} className="rom-page flex flex-col gap-16">
      <div
        data-motion
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
          <>
            <HeroPhoneBelow
              slides={slides}
              index={slideIndex}
              onSelect={setSlideIndex}
            />
            <HeroIllustration
              slides={slides}
              index={slideIndex}
              onSelect={setSlideIndex}
            />
          </>
        )}
      </div>

      {example && <ExampleMapping device={example} roms={exampleRoms} />}

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
            Most ROMs per brand
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
              Every device–ROM pair points at the page that reports it. Links
              built from a codename are checked before they are published.
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
 * A real mapping from the dataset: one device, three of its ROMs and the page
 * each one was taken from. It is the home page's proof that the numbers above
 * stand for source-linked data, not just a catalogue.
 */
function ExampleMapping({
  device,
  roms,
}: {
  device: DeviceDetail;
  roms: DeviceDetail["roms"];
}) {
  const total = device.roms.length;

  return (
    <section aria-labelledby="example-device">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-10">
          <div className="flex min-w-0 flex-col items-start">
            <p className="text-xs font-semibold text-muted-foreground">
              Example mapping
            </p>
            <h2
              id="example-device"
              className="mt-1 font-heading text-2xl font-bold tracking-tight"
            >
              {deviceName(device)}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {device.vendorName} ·{" "}
              <span className="font-mono">{device.codename}</span> ·{" "}
              {formatNumber(total)} {total === 1 ? "ROM" : "ROMs"}
            </p>
            <Link
              to={`/devices/${device.vendor}/${device.codename}`}
              prefetch="intent"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              See all {formatNumber(total)} {total === 1 ? "ROM" : "ROMs"}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="flex min-w-0 flex-col divide-y divide-border border-t border-border md:border-t-0 md:border-l md:pl-8">
            {roms.map((rom) => (
              <li key={rom.id} className="flex min-w-0 flex-col gap-0.5 py-2.5">
                <Link
                  to={`/roms/${rom.id}`}
                  prefetch="intent"
                  className="w-fit max-w-full truncate font-medium outline-none hover:text-brand hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {rom.name}
                </Link>
                {rom.referenceUrl ? (
                  <a
                    href={rom.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={rom.referenceUrl}
                    className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    <span className="truncate">
                      {referenceLabel(rom.referenceUrl)}
                    </span>
                    <ExternalLink
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No reference
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border pt-3 text-sm font-medium">
          <Link
            to="/devices"
            prefetch="intent"
            className="py-1 text-muted-foreground hover:text-foreground hover:underline"
          >
            All devices
          </Link>
          <Link
            to="/brands"
            prefetch="intent"
            className="py-1 text-muted-foreground hover:text-foreground hover:underline"
          >
            All brands
          </Link>
          <Link
            to="/roms"
            prefetch="intent"
            className="py-1 text-muted-foreground hover:text-foreground hover:underline"
          >
            All ROMs
          </Link>
        </div>
      </div>
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
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Autoplay belongs to the large illustration. The phone below `lg` is
  // stepped by hand, so the palette never changes on its own there.
  const visible = useMediaQuery("(min-width: 64rem)");
  // null follows the system preference; a toggle overrides it either way.
  const [auto, setAuto] = useState<boolean | null>(null);
  const autoplay = auto ?? !reducedMotion;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // WCAG 2.2.2: a visible control exists, and the timer also yields to hover,
  // keyboard focus and a hidden tab so nothing moves under the reader.
  useEffect(() => {
    if (
      !visible ||
      !autoplay ||
      hovered ||
      focused ||
      hidden ||
      slides.length < 2
    )
      return;
    const timer = window.setInterval(() => {
      onSelect((index + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [
    visible,
    autoplay,
    hovered,
    focused,
    hidden,
    index,
    slides.length,
    onSelect,
  ]);

  return (
    <div
      className="pointer-events-auto absolute right-8 -bottom-12 hidden lg:block xl:right-12"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      <div className="relative w-[14.5rem]">
        <RomPhone slides={slides} index={index} />

        {slides.length > 1 && (
          <div
            role="group"
            aria-label="Slideshow controls"
            className="pointer-events-auto absolute bottom-16 -left-32 flex items-center gap-1.5"
          >
            <SlideDots
              slides={slides}
              index={index}
              onSelect={(position) => {
                setAuto(false);
                onSelect(position);
              }}
            />
            <button
              type="button"
              onClick={() => {
                // Starting it is an explicit request, so let it run even while
                // this button keeps keyboard focus.
                setFocused(false);
                setAuto(!autoplay);
              }}
              aria-label={
                autoplay ? "Pause the slideshow" : "Play the slideshow"
              }
              title={autoplay ? "Pause the slideshow" : "Play the slideshow"}
              className="ml-2 flex size-6 items-center justify-center rounded-full text-panel-foreground/60 outline-none hover:text-panel-foreground/80 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {autoplay ? (
                <Pause className="size-3.5" aria-hidden="true" />
              ) : (
                <Play className="size-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {!autoplay && (
          <span role="status" aria-live="polite" className="sr-only">
            {slide.name}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The hero below `lg`: the same phone, smaller and below the copy, cropped by
 * the panel exactly like the large illustration. The negative bottom margin is
 * what lets the panel clip it; the dots step the slide by hand, so the palette
 * never moves on its own there.
 */
function HeroPhoneBelow({
  slides,
  index,
  onSelect,
}: {
  slides: RomSummary[];
  index: number;
  onSelect: (position: number) => void;
}) {
  return (
    <div className="relative mx-auto mt-8 -mb-[5.5rem] h-[16.5rem] w-32 sm:-mb-24 lg:hidden">
      <div className="origin-top-left scale-[0.55]">
        <RomPhone slides={slides} index={index} />
      </div>
      {slides.length > 1 && (
        <div
          role="group"
          aria-label="Slideshow controls"
          className="absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center"
        >
          <SlideDots
            slides={slides}
            index={index}
            onSelect={onSelect}
            buttonClassName="size-8"
            tone="screen"
          />
        </div>
      )}
    </div>
  );
}

/** The dot buttons, shared by the large illustration and the phone below. */
function SlideDots({
  slides,
  index,
  onSelect,
  buttonClassName = "size-6",
  tone = "panel",
}: {
  slides: RomSummary[];
  index: number;
  onSelect: (position: number) => void;
  buttonClassName?: string;
  tone?: "panel" | "screen";
}) {
  const active = tone === "screen" ? "bg-white/90" : "bg-panel-foreground/90";
  const idle =
    tone === "screen"
      ? "bg-white/50 hover:bg-white/70"
      : "bg-panel-foreground/60 hover:bg-panel-foreground/80";

  return (
    <>
      {slides.map((rom, position) => (
        <button
          key={rom.id}
          type="button"
          onClick={() => onSelect(position)}
          aria-label={`Show ${rom.name}`}
          aria-current={position === index ? "true" : undefined}
          className={`flex ${buttonClassName} items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
        >
          <span
            data-motion
            className={`h-2 rounded-full transition-all ${
              position === index ? `w-4 ${active}` : `w-2 ${idle}`
            }`}
          />
        </button>
      ))}
    </>
  );
}
