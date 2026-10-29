import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DevicesTable from "@/components/DevicesTable";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevices } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/devices";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const devices = loaderData?.devices ?? [];
  const updatedAt = updatedAtFromMatches(matches);
  const vendorCount = new Set(devices.map((device) => device.vendor)).size;
  const romIds = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id)),
  );

  return [
    ...pageMeta({
      title: "Devices — unrom",
      description: `${devices.length} devices from ${vendorCount} vendors, supported by ${romIds.size} custom ROMs. Browse codenames, model names and API access.`,
      path: "/devices",
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": itemListLd(
        "Devices",
        devices.map((device) => ({
          name: device.name ?? device.codename,
          path: `/devices/${device.vendor}/${device.codename}`,
        })),
      ),
    },
  ];
};

export async function loader() {
  return { devices: await fetchDevices() };
}

export async function clientLoader() {
  return { devices: await fetchDevices() };
}

export default function DevicesRoute() {
  const { devices } = useLoaderData<typeof loader>();
  const vendorCount = new Set(devices.map((device) => device.vendor)).size;
  const romCount = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id)),
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description={`${devices.length} devices from ${vendorCount} vendors, supported by ${romCount} custom ROMs.`}
        endpoint="/api/devices"
      />

      <DevicesTable devices={devices} />
    </div>
  );
}
