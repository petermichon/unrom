import type { MetaFunction } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DevicesTable from "@/components/DevicesTable";
import { PageHeader } from "@/components/PageHeader";
import { getBrowseDevices } from "@/lib/api";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "Devices — unrom" },
  {
    name: "description",
    content:
      "Browse every device and the custom ROMs and operating systems that support it.",
  },
  canonical("/devices"),
];

const devices = getBrowseDevices();

export default function DevicesRoute() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Devices" }]}
      />

      <PageHeader
        title="Devices"
        description="Every device and the custom ROMs that support it."
        endpoint="/api/devices"
      />

      <DevicesTable devices={devices} />
    </div>
  );
}
