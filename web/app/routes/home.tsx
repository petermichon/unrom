import { useState, type ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link, useLoaderData } from "react-router";
import DeviceDirectoryList from "@/components/DeviceDirectoryList";
import DeviceSearch from "@/components/DeviceSearch";
import { RomGlyph } from "@/components/RomMark";
import { hasRomMenuMark, RomMenuMark } from "@/components/RomMenuMark";
import { RomPhone, ROM_BOLD_MARKS, ROM_LOGOS } from "@/components/RomPhone";
import { MENU_ROMS } from "@/lib/nav";
import { StatusPill } from "@/components/StatusPill";
import {
  fetchBrands,
  fetchDevice,
  fetchRomSummaries,
  fetchSummary,
} from "@/lib/data";
import { deviceName } from "@/lib/devices";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { referenceLabel } from "@/lib/sort";
import { useRomPalette } from "@/lib/use-rom-palette";
import { formatNumber } from "@/lib/utils";
import type { BrandSummary, DeviceDetail, RomSummary } from "@/lib/types";
import type { Route } from "./+types/home";

async function load() {
  const [summary, roms, brands] = await Promise.all([
    fetchSummary(),
    fetchRomSummaries().catch(() => [] as RomSummary[]),
    fetchBrands().catch(() => [] as BrandSummary[]),
  ]);

  const rankedRoms = [...roms].sort((a, b) => b.deviceCount - a.deviceCount);
  const romCounts = new Map(rankedRoms.map((rom) => [rom.id, rom.deviceCount]));

  // The ROMs the hero phone steps through, led by the hardened build.
  const slides = ["grapheneos", "eos", "lineageos"]
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

  // The brands people reach for, not the largest catalogues: the device
  // pages' traffic leans to these names, and a catalogue-ordered strip would
  // lead with ZTE and LG.
  const featuredBrands = [
    "xiaomi",
    "samsung",
    "google",
    "oneplus",
    "tecno",
    "huawei",
    "infinix",
    "oppo",
  ]
    .map((vendor) => brands.find((brand) => brand.vendor === vendor))
    .filter((brand): brand is BrandSummary => brand !== undefined);

  // The same five shortcuts as the Custom ROMs mega menu, so the menu and the
  // home page never disagree about which projects are pinned.
  const browseRoms = MENU_ROMS.map((rom) =>
    roms.find((entry) => entry.id === rom.id),
  ).filter((rom): rom is RomSummary => rom !== undefined);

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
    roms: browseRoms,
    featuredBrands,
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

const EXAMPLES = ["Pixel 7", "Redmi Note 10 Pro", "LineageOS"];

// The three facts behind the catalogue, in the order a reader needs them:
// where a mapping comes from, how sure it is, and how fresh the build is.
const PROVENANCE = [
  {
    step: "01",
    title: "Each mapping links its source",
    body: "Every device–ROM pair points at the page that reports it. Links built from a codename are checked before they are published.",
  },
  {
    step: "02",
    title: "Confidence is labelled",
    body: "Curated device names carry a confidence: verified, inferred, manual or unverified, shown on the device page with the ROMs that back it.",
  },
  {
    step: "03",
    title: "Rebuilt from the sources",
    body: "The catalogue is rebuilt from each project's snapshots, and the last build date is in the footer.",
  },
];

export default function Home() {
  const {
    counts,
    topDevices,
    example,
    exampleRoms,
    slides,
    roms,
    featuredBrands,
  } = useLoaderData<typeof loader>();

  const [slideIndex, setSlideIndex] = useState(0);

  // One accent for the whole page, borrowed from CalyxOS. The phone still
  // steps through ROMs by hand, but the page palette never moves with it.
  useRomPalette("calyxos");

  return (
    <section
      data-rom="calyxos"
      className="rom-page flex flex-col gap-12 lg:gap-16"
    >
      <div
        data-motion
        className="hero-panel relative overflow-hidden rounded-4xl bg-panel px-6 py-10 text-panel-foreground ring-1 ring-black/[0.03] transition-colors sm:px-10 sm:py-12 lg:px-12 lg:py-14 dark:ring-white/[0.08]"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-center xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 max-w-2xl flex-col gap-6">
            <h1 className="max-lg:order-1 text-balance font-heading text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-[3.4rem]">
              Find the ROMs your device can run
            </h1>
            <p className="max-lg:order-3 max-w-[46ch] text-lg leading-relaxed text-panel-foreground/75">
              Device-to-ROM mappings taken from each project's own build pages,
              with the source behind every one.
            </p>
            {/* Below `lg` the field follows the headline: at 320px wide the
                lead paragraph pushed it to the bottom of the first screen. */}
            <div className="max-lg:order-2 max-w-xl">
              <DeviceSearch examples={EXAMPLES} />
            </div>
            <p className="max-lg:order-4 max-w-[52ch] text-sm leading-relaxed text-panel-foreground/70 tabular-nums">
              <span className="font-mono text-panel-foreground">
                {formatNumber(counts.devices)}
              </span>{" "}
              devices ·{" "}
              <span className="font-mono text-panel-foreground">
                {formatNumber(counts.brands)}
              </span>{" "}
              brands ·{" "}
              <span className="font-mono text-panel-foreground">
                {formatNumber(counts.coveredRoms)}
              </span>{" "}
              of{" "}
              <span className="font-mono text-panel-foreground">
                {formatNumber(counts.roms)}
              </span>{" "}
              ROMs with device data
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

      {/* The one real mapping, directly under the promise it proves. */}
      {example && <ExampleMapping device={example} roms={exampleRoms} />}

      {(featuredBrands.length > 0 || roms.length > 0) && (
        <section aria-labelledby="browse" className="flex flex-col gap-5">
          <SectionHeader
            id="browse"
            title="Browse the catalogue"
            description="Brands and projects, with the number of devices each covers."
          />

          <div className="flex flex-col gap-8">
            {featuredBrands.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    Brands
                  </h3>
                  <SectionLink
                    to="/brands"
                    label={`All ${formatNumber(counts.brands)} brands`}
                  />
                </div>
                <ul className="flex flex-wrap gap-2">
                  {featuredBrands.map((brand) => (
                    <li key={brand.vendor}>
                      <Link
                        to={`/devices/${brand.vendor}`}
                        prefetch="intent"
                        className="group flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 outline-none transition-colors hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="font-semibold group-hover:underline">
                          {brand.vendorName}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatNumber(brand.deviceCount)}
                          <span className="sr-only"> devices</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {roms.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  Custom ROMs
                </h3>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {roms.map((rom) => (
                    <li key={rom.id}>
                      <Link
                        to={`/roms/${rom.id}`}
                        prefetch="intent"
                        className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-4 outline-none transition-colors hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="flex items-start justify-between gap-2">
                          <RomIcon rom={rom} />
                          {rom.status !== "active" && (
                            <StatusPill status={rom.status} />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 font-semibold group-hover:underline">
                            {rom.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
                            {formatNumber(rom.deviceCount)} devices
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  {/* The sixth tile fills the grid and is the section's link to
                      the full index, so the list does not end in half a row. */}
                  <li>
                    <Link
                      to="/roms"
                      prefetch="intent"
                      className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 outline-none transition-colors hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground/70"
                      >
                        <ArrowRight className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold group-hover:underline">
                          All {formatNumber(counts.roms)} ROMs
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          Every project in the catalogue
                        </span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="top-devices" className="flex flex-col gap-5">
        <SectionHeader
          id="top-devices"
          title="Devices with the most ROMs"
          description={
            <>
              Ranked by the number of projects that report a build.{" "}
              <Link
                to="/devices?roms=1"
                prefetch="intent"
                className="font-medium text-foreground hover:underline"
              >
                Show only devices with ROM data
              </Link>
              .
            </>
          }
          action={<SectionLink to="/devices" label="All devices" />}
        />
        <DeviceDirectoryList devices={topDevices} />
      </section>

      <section aria-labelledby="provenance" className="flex flex-col gap-5">
        <SectionHeader
          id="provenance"
          title="Where this data comes from"
          description="Every mapping is source-linked, and confidence is labelled."
        />
        <div className="grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {PROVENANCE.map((item) => (
            <div key={item.step} className="flex flex-col gap-1.5 p-5">
              <span
                aria-hidden="true"
                className="font-mono text-xs text-muted-foreground"
              >
                {item.step}
              </span>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-foreground px-6 py-8 text-background sm:px-10 sm:py-10 dark:border dark:border-border dark:bg-card dark:text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-[52ch]">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              The dataset is open
            </h2>
            <p className="mt-1.5 text-sm text-background/70 dark:text-muted-foreground">
              The whole catalogue downloads as JSON or SQLite.
            </p>
          </div>
          <Link
            to="/data"
            prefetch="intent"
            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground outline-none hover:bg-background/90 focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90"
          >
            Get the data
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </section>
  );
}

/** A section header with the title, optional copy and one action. */
function SectionHeader({
  id,
  title,
  description,
  action,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            id={id}
            className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            {title}
          </h2>
          {description && (
            <p className="max-w-[62ch] text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-center gap-4">{action}</div>
        )}
      </div>
    </div>
  );
}

function SectionLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      prefetch="intent"
      className="-my-1 inline-flex items-center gap-1 py-1 text-sm font-semibold text-foreground hover:underline"
    >
      {label}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

/** The mark for a ROM card, inline where possible. */
function RomIcon({ rom }: { rom: RomSummary }) {
  const src = ROM_BOLD_MARKS[rom.id] ?? ROM_LOGOS[rom.id];
  return (
    <span
      aria-hidden="true"
      className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground/80"
    >
      {hasRomMenuMark(rom.id) ? (
        <RomMenuMark id={rom.id} />
      ) : src ? (
        <RomGlyph id={rom.id} src={src} className="size-5" />
      ) : (
        <span className="text-sm font-bold">{rom.name.charAt(0)}</span>
      )}
    </span>
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
            <h2 id="example-device" className="mt-1">
              <span className="block text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Example mapping
              </span>
              <span className="font-heading text-2xl font-bold tracking-tight">
                {deviceName(device)}
              </span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {device.vendorName} ·{" "}
              <span className="font-mono">{device.codename}</span> ·{" "}
              {formatNumber(total)} {total === 1 ? "ROM" : "ROMs"}
            </p>
            <Link
              to={`/devices/${device.vendor}/${device.codename}`}
              prefetch="intent"
              className="mt-2 inline-flex items-center gap-1 py-1 text-sm font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              See all {formatNumber(total)} {total === 1 ? "ROM" : "ROMs"}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <ul className="flex min-w-0 flex-col divide-y divide-border border-t border-border md:border-t-0 md:border-l md:pl-8">
            {roms.map((rom) => (
              <li key={rom.id} className="flex min-w-0 flex-col gap-1 py-2.5">
                <Link
                  to={`/roms/${rom.id}`}
                  prefetch="intent"
                  className="w-fit max-w-full truncate font-medium outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {rom.name}
                </Link>
                {rom.referenceUrl ? (
                  <a
                    href={rom.referenceUrl}
                    target="_blank"
                    rel="noopener"
                    title={rom.referenceUrl}
                    className="inline-flex max-w-full items-center gap-1 py-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    <span className="truncate">
                      {referenceLabel(rom.referenceUrl)}
                    </span>
                    <ExternalLink
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only"> (opens in a new tab)</span>
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
      </div>
    </section>
  );
}

/**
 * The hero visual: a phone running a custom ROM, not a screenshot of unrom.
 *
 * The slides switch by hand from controls inside the screen; nothing advances
 * on its own, so the page's palette never moves while it is being read. The
 * phone itself is decorative and hidden from assistive tech, while the dot
 * buttons are real controls.
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
  return (
    <div className="pointer-events-auto absolute right-8 -bottom-12 hidden lg:block xl:right-12">
      <div className="relative w-[14.5rem]">
        <RomPhone
          slides={slides}
          index={index}
          label={`${slides[index]?.name ?? "Custom ROM"} home screen`}
        />

        {slides.length > 1 && (
          <div
            role="group"
            aria-label="Slideshow controls"
            className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center"
          >
            <SlideDots
              slides={slides}
              index={index}
              onSelect={onSelect}
              tone="screen"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The hero below `lg`: the same phone, smaller and below the copy, cropped by
 * the panel exactly like the large illustration. The negative bottom margin is
 * what lets the panel clip it; the dots step the slide by hand, while the page
 * palette stays on the single CalyxOS accent.
 *
 * Phones keep the copy and the search alone: at 390px the illustration added a
 * full extra screen of green before the first mapping, and it carries no data.
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
    <div className="relative mx-auto mt-8 -mb-[4.5rem] hidden h-[13.5rem] w-32 sm:-mb-[5.5rem] sm:block sm:h-[16.5rem] lg:hidden">
      <div className="origin-top-left scale-[0.5] sm:scale-[0.55]">
        <RomPhone
          slides={slides}
          index={index}
          label={`${slides[index]?.name ?? "Custom ROM"} home screen`}
        />
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
