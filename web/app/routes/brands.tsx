import { useEffect, useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { brandGroups, brandRanking, type Brand } from "@/lib/brands";
import { fetchDevices, seedDevices } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/brands";

const FEATURED = 8;

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const devices = loaderData?.devices ?? [];
  const brands = brandRanking(devices);
  const directory = brandGroups(brands).flatMap((group) => group.brands);
  const withRoms = devices.filter((device) => device.roms.length > 0).length;

  return [
    ...pageMeta({
      title: "Brands | unrom",
      description: `Browse ${brands.length} Android brands and the ${devices.length} devices they make, ${withRoms} with custom ROM compatibility data.`,
      path: "/brands",
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
    {
      "script:ld+json": itemListLd(
        "Brands",
        directory.map((brand) => ({
          name: brand.vendorName,
          path: `/devices/${brand.vendor}`,
        })),
      ),
    },
  ];
};

export async function loader() {
  return { devices: await fetchDevices() };
}

export async function clientLoader() {
  return { devices: await fetchDevices() };
}

function BrandRow({ brand }: { brand: Brand }) {
  return (
    <Link
      to={`/devices/${brand.vendor}`}
      prefetch="intent"
      className="flex items-baseline justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5 outline-none transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="truncate font-medium">{brand.vendorName}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {brand.deviceCount} {brand.deviceCount === 1 ? "device" : "devices"}
        {" · "}
        {brand.romCount} {brand.romCount === 1 ? "ROM" : "ROMs"}
      </span>
    </Link>
  );
}

export default function BrandsRoute() {
  const { devices } = useLoaderData<typeof loader>();

  useEffect(() => {
    seedDevices(devices);
  }, [devices]);

  const brands = useMemo(() => brandRanking(devices), [devices]);
  const groups = useMemo(() => brandGroups(brands), [brands]);
  const featured = brands.slice(0, FEATURED);
  const withRoms = devices.filter((device) => device.roms.length > 0).length;

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Brands" }]} />

      <PageHeader
        title="Brands"
        description={`${brands.length} brands and ${devices.length} devices, ${withRoms} with custom ROM data.`}
        endpoint="/api/devices"
      />

      <section aria-labelledby="most-devices" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2
            id="most-devices"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Most devices
          </h2>
          <p className="text-sm text-muted-foreground">
            Ranked by devices with ROM data — not popularity.
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {featured.map((brand) => (
            <li key={brand.vendor}>
              <BrandRow brand={brand} />
            </li>
          ))}
        </ul>
      </section>

      {groups.map((group) => (
        <section
          key={group.letter}
          aria-labelledby={`brand-${group.letter}`}
          className="flex flex-col gap-2"
        >
          <h2
            id={`brand-${group.letter}`}
            className="font-heading text-sm font-semibold text-muted-foreground"
          >
            {group.letter}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {group.brands.map((brand) => (
              <li key={brand.vendor}>
                <BrandRow brand={brand} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
