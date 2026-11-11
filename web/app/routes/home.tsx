import { Link, useLoaderData } from "react-router";
import DeviceSearch from "@/components/DeviceSearch";
import { fetchDevice, fetchRomSummaries, fetchSummary } from "@/lib/data";
import { deviceName } from "@/lib/devices";
import { referenceLabel } from "@/lib/sort";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { DeviceDetail, RomSummary } from "@/lib/types";
import type { Route } from "./+types/home";

async function load() {
  const summary = await fetchSummary();
  const exampleDevice = summary.topDevices[0] ?? null;

  // The summary only carries ROM ids, so the hero's example needs one detail
  // request to show the reference behind each ROM. A failure there must not
  // take the page down.
  const [example, roms] = await Promise.all([
    exampleDevice
      ? fetchDevice(exampleDevice.vendor, exampleDevice.codename).catch(
          () => null,
        )
      : Promise.resolve(null),
    fetchRomSummaries().catch(() => [] as RomSummary[]),
  ]);

  return {
    counts: {
      devices: summary.deviceCount,
      brands: summary.brandCount,
      roms: summary.romCount,
      coveredRoms: summary.coveredRomCount,
    },
    topDevices: summary.topDevices,
    example,
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
  const { counts, topDevices, example, roms } = useLoaderData<typeof loader>();

  const sections = [
    { to: "/devices", title: "Devices", count: counts.devices },
    { to: "/brands", title: "Brands", count: counts.brands },
    { to: "/roms", title: "ROMs", count: counts.roms },
  ];

  // The hero already shows the top device, so leave it out of the list below.
  const listedDevices = topDevices.filter(
    (device) =>
      !example ||
      device.vendor !== example.vendor ||
      device.codename !== example.codename,
  );

  return (
    <section className="flex flex-col gap-16">
      <div className="rounded-4xl bg-panel px-6 py-10 text-panel-foreground ring-1 ring-black/[0.03] sm:px-10 sm:py-12 lg:px-12 lg:py-14 dark:ring-white/[0.06]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-center xl:grid-cols-[minmax(0,1fr)_23rem]">
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

          {example && <ExampleMapping device={example} />}
        </div>
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
          {listedDevices.map((device) => (
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

/** A real mapping from the dataset: the hero shows what the site is for. */
function ExampleMapping({ device }: { device: DeviceDetail }) {
  const shown = device.roms.slice(0, 3);

  return (
    <aside
      aria-label={`Example: ${deviceName(device)}`}
      className="min-w-0 rounded-xl border border-black/5 bg-card p-5 text-card-foreground dark:border-white/15"
    >
      <p className="text-sm text-muted-foreground">{device.vendorName}</p>
      <p className="mt-0.5 font-heading text-lg font-bold tracking-[-0.01em]">
        {deviceName(device)}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        {device.codename}
      </p>
      <ul className="mt-4 flex flex-col divide-y divide-border border-t border-border">
        {shown.map((rom) => (
          <li key={rom.id} className="flex min-w-0 flex-col py-1">
            <Link
              to={`/roms/${rom.id}`}
              prefetch="intent"
              className="block min-h-6 truncate leading-6 font-medium hover:underline"
            >
              {rom.name}
            </Link>
            {rom.referenceUrl ? (
              <a
                href={rom.referenceUrl}
                target="_blank"
                rel="noreferrer"
                title={rom.referenceUrl}
                className="block min-h-6 truncate leading-6 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {referenceLabel(rom.referenceUrl)}
              </a>
            ) : (
              <span className="flex min-h-6 items-center text-xs text-muted-foreground">
                No reference
              </span>
            )}
          </li>
        ))}
      </ul>
      <Link
        to={`/devices/${device.vendor}/${device.codename}`}
        prefetch="intent"
        className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
      >
        See all {device.roms.length} {device.roms.length === 1 ? "ROM" : "ROMs"}
      </Link>
    </aside>
  );
}
