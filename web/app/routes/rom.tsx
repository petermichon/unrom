import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RomDevicesTable from "@/components/RomDevicesTable";
import { fetchRom } from "@/lib/data";
import {
  SITE_URL,
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  summarizeNames,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/rom";

export async function loader({ params }: Route.LoaderArgs) {
  return { rom: await fetchRom(params.id) };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { rom: await fetchRom(params.id) };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  const rom = loaderData?.rom;
  if (error || !rom) return errorMeta("ROM not found — unrom");

  const updatedAt = updatedAtFromMatches(matches);
  const vendorCount = new Set(rom.devices.map((device) => device.vendor)).size;
  const description = `${rom.name} supports ${rom.deviceCount} ${
    rom.deviceCount === 1 ? "device" : "devices"
  } across ${vendorCount} vendor${vendorCount === 1 ? "" : "s"}, including ${summarizeNames(
    rom.devices.map((device) => device.name ?? device.codename),
    3,
  )}. Browse every supported device and codename.`;

  return [
    ...pageMeta({
      title: `${rom.name} — unrom`,
      description,
      path: `/roms/${rom.id}`,
    }),
    ...modifiedMeta(updatedAt),
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
    {
      "script:ld+json": itemListLd(
        `${rom.name} supported devices`,
        rom.devices.map((device) => ({
          name: device.name ?? device.codename,
          path: `/devices/${device.vendor}/${device.codename}`,
        })),
      ),
    },
  ];
};

export default function RomRoute() {
  const { rom } = useLoaderData<typeof loader>();

  const vendorCount = new Set(rom.devices.map((device) => device.vendor)).size;
  const description = `Supports ${rom.deviceCount}${
    rom.deviceCount === 1 ? " device" : " devices"
  } across ${vendorCount} vendor${vendorCount === 1 ? "" : "s"}, including ${summarizeNames(
    rom.devices.map((device) => device.name ?? device.codename),
    3,
  )}.`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "ROMs", to: "/roms" },
            { label: rom.name },
          ]}
        />
        <PageHeader
          title={rom.name}
          endpoint={`/api/roms/${rom.id}`}
          description={description}
        />
      </div>

      <RomDevicesTable devices={rom.devices} />
    </div>
  );
}
