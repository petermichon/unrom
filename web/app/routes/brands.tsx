import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { brandRanking, type Brand } from "@/lib/brands";
import { fetchDevices, seedDevices } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { useInitialDocument } from "@/lib/use-initial-document";
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

function BrandRow({ brand }: { brand: Brand }) {
  return (
    <Link
      to={`/devices/${brand.vendor}`}
      prefetch="intent"
      className="directory-row"
    >
      <span className="truncate font-medium">{brand.vendorName}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {brand.deviceCount} {brand.deviceCount === 1 ? "device" : "devices"}
      </span>
    </Link>
  );
}

export default function BrandsRoute() {
  const { devices } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  // Paint the header and first cards with the route; mount the rest a frame
  // later on client navigations.
  const initialDocument = useInitialDocument();
  const [full, setFull] = useState(initialDocument);
  useEffect(() => {
    if (full) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setFull(true);
    };
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(finish);
    });
    const timer = window.setTimeout(finish, 100);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      window.clearTimeout(timer);
    };
  }, [full]);

  useEffect(() => {
    seedDevices(devices);
  }, [devices]);

  const brands = useMemo(() => brandRanking(devices), [devices]);
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      needle
        ? brands.filter((brand) =>
            brand.vendorName.toLowerCase().includes(needle),
          )
        : brands,
    [brands, needle],
  );
  const withRoms = devices.filter((device) => device.roms.length > 0).length;
  const shown = full || query.trim() ? filtered : filtered.slice(0, 20);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Brands" }]} />

      <PageHeader
        title="Brands"
        description={`${brands.length} brands and ${devices.length} devices, ${withRoms} with custom ROM data. Largest catalogues first.`}
        endpoint="/api/devices"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          id="brands-search"
          value={query}
          onValueChange={setQuery}
          placeholder="Filter brands…"
          ariaLabel="Filter brands"
          className="max-w-md"
        />
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {filtered.length} of {brands.length} brands
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No brands match “{query.trim()}”.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {shown.map((brand) => (
            <li key={brand.vendor}>
              <BrandRow brand={brand} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
