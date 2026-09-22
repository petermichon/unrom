import { redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRomsTable from "@/components/DeviceRomsTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { fetchDevice } from "@/lib/data";
import { SITE_URL, canonical } from "@/lib/seo";
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

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const device = loaderData?.device;
  if (!device) return [{ title: "Device not found — unrom" }];

  const name = device.name ?? device.codename;
  return [
    { title: `${name} — unrom` },
    {
      name: "description",
      content: `Custom ROMs and operating systems that support the ${name} (${device.codename}).`,
    },
    canonical(`/devices/${device.vendor}/${device.codename}`),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        url: `${SITE_URL}/devices/${device.vendor}/${device.codename}`,
        brand: { "@type": "Brand", name: device.vendorName },
      },
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
            device.variantOf ? `Variant of ${device.variantOf}` : null,
            device.variants.length
              ? `Also covers ${device.variants.join(", ")}`
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
