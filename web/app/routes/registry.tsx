import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RegistryTable from "@/components/RegistryTable";
import { fetchDevices } from "@/lib/data";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "Registry — unrom" },
  {
    name: "description",
    content:
      "Look up a device codename by model name, or a model name by codename, with renames and compatibility groups.",
  },
  canonical("/registry"),
];

export async function loader() {
  return { devices: await fetchDevices() };
}

export async function clientLoader() {
  return { devices: await fetchDevices() };
}

export default function RegistryRoute() {
  const { devices } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Registry" }]}
      />

      <PageHeader
        title="Registry"
        description="Every codename and the model names it maps to, with renames and compatibility groups."
      />

      <RegistryTable devices={devices} />
    </div>
  );
}
