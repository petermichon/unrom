import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import DeviceSearch from "@/components/DeviceSearch";
import { ChipLink } from "@/components/ChipLink";
import { fetchDevices } from "@/lib/data";
import type { BrowseDevice } from "@/lib/types";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "unrom — the open database for device–ROM compatibility" },
  {
    name: "description",
    content:
      "Search by device name, codename, or brand to see every custom ROM that supports it.",
  },
  canonical("/"),
];

export async function loader() {
  return { devices: await fetchDevices() };
}

const EXAMPLES = ["alioth", "sweet", "beryllium"];

export default function Home() {
  const { devices } = useLoaderData<typeof loader>();
  const deviceCount = devices.length;
  const romCount = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id))
  ).size;
  const examples = EXAMPLES.map((codename) =>
    devices.find((device) => device.codename.toLowerCase() === codename)
  ).filter((device): device is BrowseDevice => device !== undefined);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
          The open database for device–ROM compatibility
        </h1>
        <p className="text-muted-foreground">
          Search by device name, codename, or brand to see every custom ROM that
          supports it.
        </p>
        <p className="text-sm text-muted-foreground">
          Tracking <span className="text-foreground">{deviceCount}</span> devices
          across <span className="text-foreground"> {romCount}</span> ROMs
        </p>
      </div>

      <DeviceSearch devices={devices} />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Try:</span>
        {examples.map((device) => (
          <ChipLink
            key={device.codename}
            to={`/device/${device.codename}`}
            className="px-2.5 py-1 text-xs"
          >
            {device.name ?? device.codename}
          </ChipLink>
        ))}
      </div>
    </section>
  );
}
