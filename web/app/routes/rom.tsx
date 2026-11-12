import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ROM_LOGOS, ROM_MARKS } from "@/components/RomPhone";
import { RomMark } from "@/components/RomMark";
import { StatusPill } from "@/components/StatusPill";
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
  if (rom.deviceCount === 0) {
    return "No device builds in the unrom dataset yet.";
  }

  const vendorCount = new Set(rom.devices.map((device) => device.vendor)).size;

  return `Supports ${formatNumber(rom.deviceCount)} ${
    rom.deviceCount === 1 ? "device" : "devices"
  } across ${formatNumber(vendorCount)} vendor${vendorCount === 1 ? "" : "s"}.`;
}

/** The page stays quiet about it, but a search result should say so. */
function romMetaDescription(rom: RomDetail): string {
  const discontinued =
    rom.status === "discontinued" ? " Discontinued upstream." : "";
  if (rom.deviceCount === 0) {
    return `No ${rom.name} builds in the unrom dataset yet.${discontinued}`;
  }

  const vendorCount = new Set(rom.devices.map((device) => device.vendor)).size;
  return `${rom.name} supports ${formatNumber(rom.deviceCount)} ${
    rom.deviceCount === 1 ? "device" : "devices"
  } across ${formatNumber(vendorCount)} vendor${
    vendorCount === 1 ? "" : "s"
  }, with the codename and model name of each.${discontinued}`;
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
  const description = romMetaDescription(rom);

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

  return (
    <div className="rom-page flex flex-col gap-8" data-rom={rom.id}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "ROMs", to: "/roms" },
          { label: rom.name },
        ]}
      />

      <div className="hero-panel relative flex flex-col gap-6 overflow-hidden rounded-4xl bg-panel px-6 py-8 text-panel-foreground ring-1 ring-black/[0.03] sm:px-8 sm:py-10 dark:ring-white/[0.08]">
        <div className="relative z-10 flex min-w-0 flex-col gap-6">
          <div className="flex min-w-0 flex-col gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              {rom.name}
            </h1>
            <p className="max-w-[62ch] text-sm leading-relaxed text-panel-foreground/75">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <StatusPill status={rom.status} tone="panel" />
              <a
                href={`/api/roms/${rom.id}`}
                title={`API response: /api/roms/${rom.id}`}
                className="font-semibold text-panel-foreground/70 underline underline-offset-4 outline-none hover:text-panel-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                API
              </a>
            </div>
          </div>
        </div>

        {mark && (
          <RomMark
            id={rom.id}
            src={mark}
            className="order-last h-24 w-60 self-end sm:absolute sm:top-1/2 sm:right-6 sm:order-none sm:h-24 sm:w-40 sm:-translate-y-1/2 md:h-28 md:w-56"
          />
        )}
      </div>

      <RomDevicesTable devices={rom.devices} />
    </div>
  );
}
