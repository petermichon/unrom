import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExportMenu } from "@/components/ExportMenu";
import MappingsTable from "@/components/MappingsTable";
import { PageHeader } from "@/components/PageHeader";
import { fetchMappings } from "@/lib/data";
import { SITE_URL, canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "Data — unrom" },
  {
    name: "description",
    content:
      "Every device ↔ custom ROM mapping as raw data — one row per pair.",
  },
  canonical("/data"),
  {
    "script:ld+json": {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "unrom device–ROM compatibility dataset",
      description:
        "Device ↔ custom ROM compatibility mappings, available via API and export.",
      url: `${SITE_URL}/data`,
      license: "https://opendatacommons.org/licenses/odbl/1-0/",
      creator: { "@type": "Organization", name: "unrom", url: SITE_URL },
    },
  },
];

export async function loader() {
  return { mappings: await fetchMappings() };
}

export async function clientLoader() {
  return { mappings: await fetchMappings() };
}

export default function DataRoute() {
  const { mappings } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Data" }]} />

      <PageHeader
        title="Data"
        description="One row per device/ROM pair."
        endpoint="/api/data"
        actions={<ExportMenu />}
      />

      <MappingsTable mappings={mappings} />
    </div>
  );
}
