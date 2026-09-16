import { useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RomDevicesTable from "@/components/RomDevicesTable";
import { fetchRom } from "@/lib/data";
import { SITE_URL, canonical } from "@/lib/seo";
import type { Route } from "./+types/rom";

export async function loader({ params }: Route.LoaderArgs) {
  return { rom: await fetchRom(params.id) };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { rom: await fetchRom(params.id) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const rom = loaderData?.rom;
  if (!rom) return [{ title: "ROM not found — unrom" }];

  return [
    { title: `${rom.name} — unrom` },
    { name: "description", content: `Every device supported by ${rom.name}.` },
    canonical(`/roms/${rom.id}`),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: rom.name,
        applicationCategory: "OperatingSystem",
        url: `${SITE_URL}/roms/${rom.id}`,
      },
    },
  ];
};

export default function RomRoute() {
  const { rom } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "ROMs", to: "/roms" },
            { label: rom.name },
          ]}
        />
        <PageHeader
          title={rom.name}
          endpoint={`/api/roms/${rom.id}`}
          description={`Supports ${rom.deviceCount}${
            rom.deviceCount === 1 ? " device" : " devices"
          }`}
        />
      </div>

      <RomDevicesTable devices={rom.devices} />
    </div>
  );
}
