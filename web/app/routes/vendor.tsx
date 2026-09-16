import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DevicesTable from "@/components/DevicesTable";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevices } from "@/lib/data";
import { canonical } from "@/lib/seo";
import type { Route } from "./+types/vendor";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Vendor not found — unrom" }];
  const { vendor, vendorName } = loaderData;
  return [
    { title: `${vendorName} devices — unrom` },
    {
      name: "description",
      content: `Every ${vendorName} device and the custom ROMs that support it.`,
    },
    canonical(`/devices/${vendor}`),
  ];
};

async function load(vendor: string) {
  const devices = await fetchDevices(vendor);
  if (devices.length === 0) {
    throw new Response("Not found", { status: 404 });
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
        } across ${romCount} ROM${romCount === 1 ? "" : "s"}.`}
        endpoint={`/api/devices?vendor=${vendor}`}
      />

      <DevicesTable devices={devices} />
    </div>
  );
}
