import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DevicesTable from "@/components/DevicesTable";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevices } from "@/lib/data";
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

export async function loader() {
  return { devices: await fetchDevices() };
}

export async function clientLoader() {
  return { devices: await fetchDevices() };
}

export default function DevicesRoute() {
  const { devices } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description="Every device and the custom ROMs that support it."
        endpoint="/api/devices"
      />

      <DevicesTable devices={devices} />
    </div>
  );
}
