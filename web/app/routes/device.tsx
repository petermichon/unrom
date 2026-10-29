import { redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRomsTable from "@/components/DeviceRomsTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { fetchDevice } from "@/lib/data";
import {
  SITE_URL,
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  summarizeNames,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/device";

// An alternate codename (alias) resolves to the canonical device; redirect so
// the URL and every generated link agree on one canonical address.
async function loadDevice(params: { vendor: string; codename: string }) {
  const device = await fetchDevice(params.vendor, params.codename);
  if (device.vendor !== params.vendor || device.codename !== params.codename) {
    throw redirect(`/devices/${device.vendor}/${device.codename}`, 301);
  }
  return { device };
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadDevice(params);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadDevice(params);
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  const device = loaderData?.device;
  if (error || !device) return errorMeta("Device not found — unrom");

  const updatedAt = updatedAtFromMatches(matches);
  const name = device.name ?? device.codename;
  const description = `The ${name} (${device.codename}) by ${device.vendorName} is supported by ${device.roms.length} custom ${
    device.roms.length === 1 ? "ROM" : "ROMs"
  }, including ${summarizeNames(
    device.roms.map((rom) => rom.name),
    3,
  )}.`;

  return [
    ...pageMeta({
      title: `${name} (${device.codename}) — unrom`,
      description,
      path: `/devices/${device.vendor}/${device.codename}`,
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        model: device.codename,
        url: `${SITE_URL}/devices/${device.vendor}/${device.codename}`,
        brand: { "@type": "Brand", name: device.vendorName },
        ...(updatedAt ? { dateModified: updatedAt } : {}),
      },
    },
    {
      "script:ld+json": itemListLd(
        `${name} supported ROMs`,
        device.roms.map((rom) => ({
          name: rom.name,
          path: `/roms/${rom.id}`,
        })),
      ),
    },
  ];
};

export default function DeviceRoute() {
  const { device } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Devices", to: "/devices" },
            { label: device.vendorName, to: `/devices/${device.vendor}` },
            { label: device.name ?? device.codename },
          ]}
        />

        <PageHeader
          title={device.name ?? device.codename}
          endpoint={`/api/devices/${device.vendor}/${device.codename}`}
          badge={
            <Badge
              variant="outline"
              className="bg-muted font-mono text-xs text-foreground"
            >
              {device.codename}
            </Badge>
          }
          description={[
            `${device.vendorName} · Supported by ${device.roms.length}${
              device.roms.length === 1 ? " ROM" : " ROMs"
            }`,
            device.names.length > 1
              ? `Models: ${device.names.join(" / ")}`
              : null,
            device.group.length > 1
              ? `Build covers ${device.group.join(", ")}`
              : null,
            device.aliases.length
              ? `Also known as ${device.aliases.join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
      </div>

      <DeviceRomsTable roms={device.roms} />
    </div>
  );
}
