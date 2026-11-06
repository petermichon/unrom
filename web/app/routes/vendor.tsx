import { useMemo, useState } from "react";
import { redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRow from "@/components/DeviceRow";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { deviceName } from "@/lib/devices";
import { deviceHaystack, matchesAll, tokenize } from "@/lib/search";
import { bySortKey } from "@/lib/sort";
import { fetchDevices } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  summarizeNames,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/vendor";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta("Brand not found | unrom");
  const { vendor, vendorName, devices } = loaderData;
  const updatedAt = updatedAtFromMatches(matches);
  const romCount = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id)),
  ).size;
  return [
    ...pageMeta({
      title: `${vendorName} devices | unrom`,
      description: `${devices.length} ${vendorName} device${
        devices.length === 1 ? "" : "s"
      } across ${romCount} custom ROM${romCount === 1 ? "" : "s"}, including ${summarizeNames(
        devices.map((device) => device.name ?? device.codename),
        3,
      )}. Browse codenames and API access.`,
      path: `/devices/${vendor}`,
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": itemListLd(
        `${vendorName} devices`,
        devices
          .filter((device) => device.roms.length > 0)
          .map((device) => ({
            name: deviceName(device),
            path: `/devices/${device.vendor}/${device.codename}`,
          })),
      ),
    },
  ];
};

async function load(vendor: string) {
  const devices = await fetchDevices(vendor);
  if (devices.length === 0) {
    throw new Response("Not found", { status: 404 });
  }
  // The API matches vendors case-insensitively; redirect to the canonical
  // (lowercase) vendor so aliases do not become duplicate, self-canonical URLs.
  if (devices[0].vendor !== vendor) {
    throw redirect(`/devices/${encodeURIComponent(devices[0].vendor)}`, 301);
  }
  return { vendor, vendorName: devices[0].vendorName, devices };
}

export async function loader({ params }: Route.LoaderArgs) {
  return load(params.vendor);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return load(params.vendor);
}

export default function VendorRoute() {
  const { vendor, vendorName, devices } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");
  const romCount = new Set(
    devices.flatMap((device) => device.roms.map((rom) => rom.id)),
  ).size;

  const ranked = useMemo(
    () =>
      [...devices].sort(
        (a, b) =>
          b.roms.length - a.roms.length ||
          bySortKey(deviceName(a), deviceName(b)),
      ),
    [devices],
  );
  const filtered = useMemo(() => {
    const terms = tokenize(query);
    return terms.length === 0
      ? ranked
      : ranked.filter((device) => matchesAll(deviceHaystack(device), terms));
  }, [ranked, query]);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Devices", to: "/devices" },
          { label: vendorName },
        ]}
      />

      <PageHeader
        title={vendorName}
        description={`${devices.length} device${
          devices.length === 1 ? "" : "s"
        } across ${romCount} ROM${romCount === 1 ? "" : "s"}, including ${summarizeNames(
          devices.map((device) => deviceName(device)),
          3,
        )}.`}
        endpoint={`/api/devices?vendor=${vendor}`}
      />

      {devices.length > 20 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            id="vendor-devices-search"
            value={query}
            onValueChange={setQuery}
            placeholder="Filter this brand's devices…"
            ariaLabel="Filter devices"
            className="max-w-md"
          />
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground tabular-nums"
          >
            {filtered.length} of {devices.length} devices
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No devices match.
        </p>
      ) : (
        <ul className="flex flex-col">
          {filtered.map((device) => (
            <li key={`${device.vendor}/${device.codename}`}>
              <DeviceRow device={device} showBrand={false} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
