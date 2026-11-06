import { Link, redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRomsTable from "@/components/DeviceRomsTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { fetchDevice } from "@/lib/data";
import {
  SITE_URL,
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  summarizeNames,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { DeviceDetail } from "@/lib/types";
import type { Route } from "./+types/device";

// An alternate codename (alias) resolves to the canonical device; redirect so
// the URL and every generated link agree on one canonical address.
async function loadDevice(params: { vendor: string; codename: string }) {
  const device = await fetchDevice(params.vendor, params.codename);
  if (device.vendor !== params.vendor || device.codename !== params.codename) {
    throw redirect(`/devices/${device.vendor}/${device.codename}`, 301);
  }
  return { device };
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadDevice(params);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadDevice(params);
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  const device = loaderData?.device;
  if (error || !device) return errorMeta("Device not found | unrom");

  const updatedAt = updatedAtFromMatches(matches);
  const name = device.name ?? device.codename;
  const description =
    device.roms.length === 0
      ? `The ${name} (${device.codename}) by ${device.vendorName}. unrom tracks this device but holds no custom ROM build data for it yet.`
      : `The ${name} (${device.codename}) by ${device.vendorName} is supported by ${device.roms.length} custom ${
          device.roms.length === 1 ? "ROM" : "ROMs"
        }, including ${summarizeNames(
          device.roms.map((rom) => rom.name),
          3,
        )}.`;

  return [
    ...pageMeta({
      title: `${name} (${device.codename}) | unrom`,
      description,
      path: `/devices/${device.vendor}/${device.codename}`,
    }),
    ...modifiedMeta(updatedAt),
    ...(device.roms.length === 0
      ? [{ name: "robots", content: "noindex" }]
      : []),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        model: device.codename,
        url: `${SITE_URL}/devices/${device.vendor}/${device.codename}`,
        brand: { "@type": "Brand", name: device.vendorName },
        ...(updatedAt ? { dateModified: updatedAt } : {}),
      },
    },
    ...(device.roms.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              `${name} supported ROMs`,
              device.roms.map((rom) => ({
                name: rom.name,
                path: `/roms/${rom.id}`,
              })),
            ),
          },
        ]
      : []),
  ];
};

export default function DeviceRoute() {
  const { device } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Devices", to: "/devices" },
            { label: device.vendorName, to: `/devices/${device.vendor}` },
            { label: device.name ?? device.codename },
          ]}
        />

        <PageHeader
          title={device.name ?? device.codename}
          endpoint={`/api/devices/${device.vendor}/${device.codename}`}
          badge={
            <Badge
              variant="outline"
              className="bg-muted font-mono text-xs text-foreground"
            >
              {device.codename}
            </Badge>
          }
          description={
            device.roms.length === 0
              ? `${device.vendorName} · No custom ROM data yet`
              : `${device.vendorName} · Supported by ${device.roms.length} ${
                  device.roms.length === 1 ? "ROM" : "ROMs"
                }`
          }
        />
      </div>

      <DeviceIdentity device={device} />

      <DeviceRomsTable roms={device.roms} />
    </div>
  );
}

const CONFIDENCE_LABELS = {
  verified: "Verified",
  inferred: "Inferred",
  manual: "Manual",
  unverified: "Unverified",
} as const;

/** Curated identity and provenance, folded in from the old registry page. */
function DeviceIdentity({ device }: { device: DeviceDetail }) {
  return (
    <section
      aria-labelledby="device-identity"
      className="rounded-xl border border-border/60 p-4"
    >
      <h2
        id="device-identity"
        className="mb-3 font-heading text-sm font-semibold"
      >
        Identity
      </h2>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
        {device.names.length > 1 && (
          <>
            <dt className="text-muted-foreground">Model names</dt>
            <dd>{device.names.join(" / ")}</dd>
          </>
        )}
        {device.aliases.length > 0 && (
          <>
            <dt className="text-muted-foreground">Also known as</dt>
            <dd className="font-mono text-xs">{device.aliases.join(", ")}</dd>
          </>
        )}
        {device.group.length > 1 && (
          <>
            <dt className="text-muted-foreground">Build covers</dt>
            <dd className="font-mono text-xs">{device.group.join(", ")}</dd>
          </>
        )}
        <dt className="text-muted-foreground">Curation</dt>
        <dd className="flex flex-wrap items-center gap-2">
          {device.confidence ? (
            <>
              <Badge variant="outline">
                {CONFIDENCE_LABELS[device.confidence]}
              </Badge>
              {device.sources.length > 0 && (
                <span className="text-muted-foreground">
                  Sources:{" "}
                  {device.sources.map((id, index) => (
                    <span key={id}>
                      {index > 0 && ", "}
                      <Link
                        to={`/roms/${id}`}
                        prefetch="intent"
                        className="font-mono text-xs hover:text-foreground hover:underline"
                      >
                        {id}
                      </Link>
                    </span>
                  ))}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">
              Not in the name registry yet
            </span>
          )}
        </dd>
      </dl>
    </section>
  );
}
