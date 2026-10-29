import { redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DevicesTable from "@/components/DevicesTable";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevices } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  summarizeNames,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/vendor";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta("Vendor not found — unrom");
  const { vendor, vendorName, devices } = loaderData;
  const updatedAt = updatedAtFromMatches(matches);
  const romCount = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id)),
  ).size;
  return [
    ...pageMeta({
      title: `${vendorName} devices — unrom`,
      description: `${devices.length} ${vendorName} device${
        devices.length === 1 ? "" : "s"
      } across ${romCount} custom ROM${romCount === 1 ? "" : "s"}, including ${summarizeNames(
        devices.map((device) => device.name ?? device.codename),
        3,
      )}. Browse codenames and API access.`,
      path: `/devices/${vendor}`,
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": itemListLd(
        `${vendorName} devices`,
        devices.map((device) => ({
          name: device.name ?? device.codename,
          path: `/devices/${device.vendor}/${device.codename}`,
        })),
      ),
    },
  ];
};

async function load(vendor: string) {
  const devices = await fetchDevices(vendor);
  if (devices.length === 0) {
    throw new Response("Not found", { status: 404 });
  }
  // The API matches vendors case-insensitively; redirect to the canonical
  // (lowercase) vendor so aliases do not become duplicate, self-canonical URLs.
  if (devices[0].vendor !== vendor) {
    throw redirect(`/devices/${encodeURIComponent(devices[0].vendor)}`, 301);
  }
  return { vendor, vendorName: devices[0].vendorName, devices };
}

export async function loader({ params }: Route.LoaderArgs) {
  return load(params.vendor);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return load(params.vendor);
}

export default function VendorRoute() {
  const { vendor, vendorName, devices } = useLoaderData<typeof loader>();
  const romCount = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id)),
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Devices", to: "/devices" },
          { label: vendorName },
        ]}
      />

      <PageHeader
        title={vendorName}
        description={`${devices.length} device${
          devices.length === 1 ? "" : "s"
        } across ${romCount} ROM${romCount === 1 ? "" : "s"}, including ${summarizeNames(
          devices.map((device) => device.name ?? device.codename),
          3,
        )}.`}
        endpoint={`/api/devices?vendor=${vendor}`}
      />

      <DevicesTable devices={devices} renderAllRows />
    </div>
  );
}
