import type { MetaFunction } from "react-router";
import { useParams } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRomsTable from "@/components/DeviceRomsTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { findDevice } from "@/lib/api";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = ({ params }) => {
  const device = params.codename ? findDevice(params.codename) : null;
  const name = device?.name ?? device?.codename ?? "Device";
  return [
    { title: `${name} — unrom` },
    {
      name: "description",
      content: `Custom ROMs and operating systems that support the ${name}${
        device ? ` (${device.codename})` : ""
      }.`,
    },
    ...(params.codename ? [canonical(`/device/${params.codename}`)] : []),
  ];
};

export default function DeviceRoute() {
  const { codename } = useParams();
  const device = codename ? findDevice(codename) : null;

  if (!device) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Devices", to: "/devices" },
            { label: "Not found" },
          ]}
        />
        <p className="text-muted-foreground">
          No device found for “{codename}”.
        </p>
      </div>
    );
  }

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
              className="bg-muted font-mono text-xs text-muted-foreground"
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
