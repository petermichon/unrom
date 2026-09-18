import type { MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { useMemo } from "react";
import DeviceSearch from "@/components/DeviceSearch";
import { fetchDevices } from "@/lib/data";
import { canonical } from "@/lib/seo";

export const meta: MetaFunction = () => [
  { title: "unrom — the open database for device–ROM compatibility" },
  {
    name: "description",
    content:
      "Search by device name, codename, vendor, or ROM to find supported devices and custom ROMs.",
  },
  canonical("/"),
];

export async function loader() {
  return { devices: await fetchDevices() };
}

// Same data as the server loader, but read from the client-side cache on
// navigation so transitions never hit the network again.
export async function clientLoader() {
  return { devices: await fetchDevices() };
}

const EXAMPLES = ["Redmi Note 7", "vayu", "Nothing", "LineageOS"];

export default function Home() {
  const { devices } = useLoaderData<typeof loader>();

  // Every ROM in the dataset supports at least one device, so the device chips
  // already carry the full, deduplicated ROM list — no extra fetch needed.
  const roms = useMemo(() => {
    const map = new Map<string, string>();
    for (const device of devices) {
      for (const rom of device.roms) map.set(rom.id, rom.name);
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [devices]);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance">
          The open database for device–ROM compatibility
        </h1>
        <p className="text-muted-foreground">
          Search by device name, codename, vendor, or ROM to see what supports
          it.
        </p>
        <p className="text-sm text-muted-foreground">
          Tracking <span className="text-foreground">{devices.length}</span>{" "}
          devices across <span className="text-foreground"> {roms.length}</span>{" "}
          ROMs
        </p>
      </div>

      <DeviceSearch devices={devices} roms={roms} examples={EXAMPLES} />
    </section>
  );
}
