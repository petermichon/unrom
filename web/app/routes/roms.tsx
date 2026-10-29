import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RomsTable from "@/components/RomsTable";
import { fetchRoms } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/roms";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const roms = loaderData?.roms ?? [];
  const updatedAt = updatedAtFromMatches(matches);
  const deviceCount = new Set(
    roms.flatMap((rom) =>
      rom.devices.map((device) => `${device.vendor}/${device.codename}`),
    ),
  ).size;

  return [
    ...pageMeta({
      title: "ROMs — unrom",
      description: `${roms.length} custom ROMs covering ${deviceCount} devices. Browse every Android ROM and the devices it supports, with API access.`,
      path: "/roms",
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": itemListLd(
        "Custom ROMs",
        roms.map((rom) => ({ name: rom.name, path: `/roms/${rom.id}` })),
      ),
    },
  ];
};

export async function loader() {
  return { roms: await fetchRoms() };
}

export async function clientLoader() {
  return { roms: await fetchRoms() };
}

export default function RomsRoute() {
  const { roms } = useLoaderData<typeof loader>();
  const deviceCount = new Set(
    roms.flatMap((rom) =>
      rom.devices.map((device) => `${device.vendor}/${device.codename}`),
    ),
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "ROMs" }]} />

      <PageHeader
        title="ROMs"
        description={`${roms.length} custom ROMs covering ${deviceCount} devices.`}
        endpoint="/api/roms"
      />

      <RomsTable roms={roms} />
    </div>
  );
}
