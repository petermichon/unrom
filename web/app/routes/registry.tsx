import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RegistryTable from "@/components/RegistryTable";
import { fetchRegistry } from "@/lib/data";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "Registry — unrom" },
  {
    name: "description",
    content:
      "Look up a curated device model name by vendor and codename, or the reverse.",
  },
  canonical("/registry"),
];

export async function loader() {
  return { entries: await fetchRegistry() };
}

export async function clientLoader() {
  return { entries: await fetchRegistry() };
}

export default function RegistryRoute() {
  const { entries } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Registry" }]}
      />

      <PageHeader
        title="Registry"
        description="Curated vendor and codename to model name mappings."
      />

      <RegistryTable entries={entries} />
    </div>
  );
}
