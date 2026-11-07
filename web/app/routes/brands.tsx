import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { brandRanking, type Brand } from "@/lib/brands";
import { fetchBrands, seedBrands } from "@/lib/data";
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
  const brands = brandRanking(loaderData?.brands ?? []);
  const devices = brands.reduce((sum, brand) => sum + brand.deviceCount, 0);
  const withRoms = brands.reduce((sum, brand) => sum + brand.withRoms, 0);

  return [
    ...pageMeta({
      title: "Android brands and ROM coverage | unrom",
      description: `Browse ${brands.length} Android brands and the ${devices} devices they make, ${withRoms} with custom ROM compatibility data.`,
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
  return { brands: await fetchBrands() };
}

export async function clientLoader() {
  return { brands: await fetchBrands() };
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
  const { brands: rawBrands } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");

  useEffect(() => {
    seedBrands(rawBrands);
  }, [rawBrands]);

  const brands = useMemo(() => brandRanking(rawBrands), [rawBrands]);
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
  const devices = brands.reduce((sum, brand) => sum + brand.deviceCount, 0);
  const withRoms = brands.reduce((sum, brand) => sum + brand.withRoms, 0);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Brands" }]} />

      <PageHeader
        title="Brands"
        description={`${brands.length} brands and ${devices} devices, ${withRoms} with custom ROM data. Largest catalogues first.`}
        endpoint="/api/brands"
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
          {filtered.map((brand) => (
            <li key={brand.vendor}>
              <BrandRow brand={brand} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
