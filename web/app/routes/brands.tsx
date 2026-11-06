import { useEffect, useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { brandRanking } from "@/lib/brands";
import { fetchDevices, seedDevices } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/brands";

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const devices = loaderData?.devices ?? [];
  const brands = brandRanking(devices);
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
        brands.map((brand) => ({
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

export default function BrandsRoute() {
  const { devices } = useLoaderData<typeof loader>();

  useEffect(() => {
    seedDevices(devices);
  }, [devices]);

  const brands = useMemo(() => brandRanking(devices), [devices]);
  const withRoms = devices.filter((device) => device.roms.length > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Brands" }]} />

      <PageHeader
        title="Brands"
        description={`${brands.length} brands and ${devices.length} devices, ${withRoms} with custom ROM data.`}
        endpoint="/api/devices"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.vendor}
            to={`/devices/${brand.vendor}`}
            prefetch="intent"
            className="flex flex-col gap-1 rounded-xl border border-border/60 p-4 outline-none transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="font-medium">{brand.vendorName}</span>
            <span className="text-sm text-muted-foreground">
              {brand.deviceCount}{" "}
              {brand.deviceCount === 1 ? "device" : "devices"}
              {" · "}
              {brand.withRoms} with ROM data
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
