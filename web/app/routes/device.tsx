import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRomsTable from "@/components/DeviceRomsTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { fetchDevice } from "@/lib/data";
import { SITE_URL, canonical } from "@/lib/seo";
import type { Route } from "./+types/device";

export async function loader({ params }: Route.LoaderArgs) {
  return { device: await fetchDevice(params.codename) };
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
    canonical(`/devices/${device.codename}`),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        url: `${SITE_URL}/devices/${device.codename}`,
        ...(device.brand
          ? { brand: { "@type": "Brand", name: device.brand } }
          : {}),
      },
    },
  ];
};

export default function DeviceRoute() {
  const { device } = useLoaderData<typeof loader>();
  const activeCount = device.roms.filter((rom) => rom.active).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Devices", to: "/devices" },
            { label: device.name ?? device.codename },
          ]}
        />

        <PageHeader
          title={device.name ?? device.codename}
          endpoint={`/api/devices/${device.codename}`}
          badge={
            <Badge
              variant="outline"
              className="bg-muted font-mono text-xs text-foreground"
            >
              {device.codename}
            </Badge>
          }
          description={`${device.brand ?? "Unknown brand"} · Supported by ${
            device.roms.length
          }${device.roms.length === 1 ? " ROM" : " ROMs"}${
            activeCount < device.roms.length ? ` (${activeCount} active)` : ""
          }`}
        />
      </div>

      <DeviceRomsTable roms={device.roms} />
    </div>
  );
}
