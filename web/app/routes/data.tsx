import type { MetaFunction } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExportMenu } from "@/components/ExportMenu";
import MappingsTable from "@/components/MappingsTable";
import { PageHeader } from "@/components/PageHeader";
import { getMappings } from "@/lib/api";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "Data — unrom" },
  {
    name: "description",
    content: "Every device ↔ custom ROM mapping as raw data — one row per pair.",
  },
  canonical("/data"),
];

const mappings = getMappings();

export default function DataRoute() {
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
