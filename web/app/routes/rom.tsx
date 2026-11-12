import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ROM_LOGOS, ROM_MARKS } from "@/components/RomPhone";
import { useRomPalette } from "@/lib/use-rom-palette";
import RomDevicesTable from "@/components/RomDevicesTable";
import { fetchRom } from "@/lib/data";
import {
  SITE_URL,
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { RomDetail } from "@/lib/types";
import type { Route } from "./+types/rom";

/** A ROM we track can have no builds in the dataset (discontinued projects). */
function romDescription(rom: RomDetail): string {
  const discontinued =
    rom.status === "discontinued" ? " Discontinued upstream." : "";

  if (rom.deviceCount === 0) {
    return `No device builds in the unrom dataset yet.${discontinued}`;
  }

  const vendorCount = new Set(rom.devices.map((device) => device.vendor)).size;
  const names = rom.devices
    .slice(0, 3)
    .map((device) => device.name ?? device.codename)
    .join(", ");

  return `Supports ${formatNumber(rom.deviceCount)} ${
    rom.deviceCount === 1 ? "device" : "devices"
  } across ${formatNumber(vendorCount)} vendor${vendorCount === 1 ? "" : "s"}, including ${names}.${discontinued}`;
}

export async function loader({ params }: Route.LoaderArgs) {
  return { rom: await fetchRom(params.id) };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { rom: await fetchRom(params.id) };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  const rom = loaderData?.rom;
  if (error || !rom) return errorMeta("ROM not found | unrom");

  const updatedAt = updatedAtFromMatches(matches);
  const description = romDescription(rom);

  return [
    ...pageMeta({
      title:
        rom.deviceCount === 0
          ? `${rom.name} | unrom`
          : `${rom.name} supported devices | unrom`,
      description,
      path: `/roms/${rom.id}`,
    }),
    ...modifiedMeta(updatedAt),
    ...(rom.deviceCount === 0 ? [{ name: "robots", content: "noindex" }] : []),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: rom.name,
        description,
        applicationCategory: "OperatingSystem",
        operatingSystem: "Android",
        isAccessibleForFree: true,
        url: `${SITE_URL}/roms/${rom.id}`,
        ...(updatedAt ? { dateModified: updatedAt } : {}),
      },
    },
    ...(rom.devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              `${rom.name} supported devices`,
              rom.devices.map((device) => ({
                name: device.name ?? device.codename,
                path: `/devices/${device.vendor}/${device.codename}`,
              })),
            ),
          },
        ]
      : []),
  ];
};

export default function RomRoute() {
  const { rom } = useLoaderData<typeof loader>();

  const description = romDescription(rom);
  const mark = ROM_MARKS[rom.id] ?? ROM_LOGOS[rom.id];
  useRomPalette(rom.id);
  const deviceLabel =
    rom.deviceCount === 0
      ? "No device builds"
      : `${formatNumber(rom.deviceCount)} ${
          rom.deviceCount === 1 ? "device" : "devices"
        }`;

  return (
    <div className="rom-page flex flex-col gap-8" data-rom={rom.id}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "ROMs", to: "/roms" },
          { label: rom.name },
        ]}
      />

      <div className="hero-panel relative overflow-hidden rounded-4xl bg-panel px-6 py-8 text-panel-foreground ring-1 ring-black/[0.03] sm:px-8 sm:py-10 dark:ring-white/[0.06]">
        {mark && (
          <div
            aria-hidden="true"
            data-rom-mark={rom.id}
            className="pointer-events-none absolute top-1/2 right-6 hidden h-44 w-[27.6rem] -translate-y-1/2 lg:block"
            style={{
              backgroundColor:
                "color-mix(in oklab, var(--panel) 88%, var(--panel-foreground))",
              WebkitMaskImage: `url("${mark}")`,
              maskImage: `url("${mark}")`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        )}
        <div className="relative flex min-w-0 flex-col gap-6">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center gap-3">
              {ROM_LOGOS[rom.id] && (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#101318] lg:hidden">
                  <img src={ROM_LOGOS[rom.id]} alt="" className="h-4 w-auto" />
                </span>
              )}
              <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                {rom.name}
              </h1>
            </div>
            <p className="max-w-[62ch] text-sm leading-relaxed text-panel-foreground/75">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="text-panel-foreground/70 tabular-nums">
                {deviceLabel}
              </span>
              <a
                href={`/api/roms/${rom.id}`}
                title={`API response: /api/roms/${rom.id}`}
                className="font-semibold text-panel-foreground/70 underline underline-offset-4 outline-none hover:text-panel-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                API
              </a>
              <Link
                to="/roms"
                className="font-semibold text-brand hover:underline"
              >
                All ROMs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <RomDevicesTable devices={rom.devices} />
    </div>
  );
}
