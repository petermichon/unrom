import type { MetaFunction } from "react-router";
import { useParams } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import RomDevicesTable from "@/components/RomDevicesTable";
import { StatusBadge } from "@/components/StatusBadge";
import { getRom } from "@/lib/api";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = ({ params }) => {
  const rom = params.id ? getRom(params.id) : null;
  const name = rom?.name ?? "ROM";
  return [
    { title: `${name} — unrom` },
    {
      name: "description",
      content: `Every device supported by ${name}.`,
    },
    ...(params.id ? [canonical(`/rom/${params.id}`)] : []),
  ];
};

export default function RomRoute() {
  const { id } = useParams();
  const rom = id ? getRom(id) : null;

  if (!rom) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "ROMs", to: "/roms" },
            { label: "Not found" },
          ]}
        />
        <p className="text-muted-foreground">No ROM found for “{id}”.</p>
      </div>
    );
  }

  const versionLabel = [
    rom.androidBases.length > 0
      ? `Android ${rom.androidBases.join(", ")}`
      : null,
    rom.romVersions.length > 0 ? `v${rom.romVersions.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

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
          badge={<StatusBadge active={rom.active} />}
          description={`Supports ${rom.deviceCount}${
            rom.deviceCount === 1 ? " device" : " devices"
          }${versionLabel ? ` · ${versionLabel}` : ""}`}
        />
      </div>

      <RomDevicesTable devices={rom.devices} />
    </div>
  );
}
