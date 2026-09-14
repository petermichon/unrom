import type { MetaFunction } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RomsTable from "@/components/RomsTable";
import { getBrowseRoms } from "@/lib/api";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "ROMs — unrom" },
  {
    name: "description",
    content: "Browse every custom ROM and the devices it supports.",
  },
  canonical("/roms"),
];

const roms = getBrowseRoms();

export default function RomsRoute() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "ROMs" }]} />

      <PageHeader
        title="ROMs"
        description="Every custom ROM and the devices it supports."
        endpoint="/api/roms"
      />

      <RomsTable roms={roms} />
    </div>
  );
}
