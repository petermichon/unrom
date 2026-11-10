import { Form, Link, redirect, useLoaderData } from "react-router";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRow from "@/components/DeviceRow";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { fetchBrands, fetchDevicesPage, fetchSummary } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { bySortKey } from "@/lib/sort";
import { cn, formatNumber } from "@/lib/utils";
import type { Route } from "./+types/devices";

const PAGE_SIZE = 200;

interface FilterState {
  q: string;
  vendor: string | null;
  roms: boolean;
  page: number;
}

/** Canonical directory URL for a filter state. */
function directoryHref(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.vendor) params.set("vendor", filters.vendor);
  if (filters.roms) params.set("roms", "1");
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));
  const search = params.toString();
  return search ? `/devices?${search}` : "/devices";
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta();
  const { q, vendorName, total, page, pages, isIndexable } = loaderData;

  return [
    ...pageMeta({
      title: q
        ? `Devices matching “${q}” | unrom`
        : vendorName
          ? `${vendorName} devices | unrom`
          : "Android devices and ROM support | unrom",
      description: q
        ? `${formatNumber(total)} devices match “${q}” in the unrom directory.`
        : vendorName
          ? `${formatNumber(total)} ${vendorName} devices${
              page > 1 ? `, page ${page} of ${pages}` : ""
            }. Search the catalogue or show only devices with ROM data.`
          : `${formatNumber(total)} devices. Search by name or codename, filter by brand, or show only devices with ROM data.`,
      path: loaderData.href,
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
    ...(isIndexable ? [] : [{ name: "robots", content: "noindex" }]),
    ...(loaderData.devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              q ? `Devices matching ${q}` : (vendorName ?? "Devices"),
              loaderData.devices.map((device) => ({
                name: device.name ?? device.codename,
                path: `/devices/${device.vendor}/${device.codename}`,
              })),
            ),
          },
        ]
      : []),
  ];
};

async function load(request: URL) {
  const q = (request.searchParams.get("q") ?? "").trim();
  const rawVendor = (request.searchParams.get("vendor") ?? "").trim();
  const roms = request.searchParams.get("roms") === "1";
  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );

  // Letter pages are gone; land old links on the unfiltered directory.
  if (request.searchParams.has("letter")) {
    throw redirect("/devices", 301);
  }

  const [summary, brands] = await Promise.all([fetchSummary(), fetchBrands()]);
  const brand = rawVendor
    ? brands.find((entry) => entry.vendor === rawVendor.toLowerCase())
    : undefined;
  if (rawVendor && !brand) throw new Response("Not found", { status: 404 });
  if (brand && brand.vendor !== rawVendor) {
    throw redirect(directoryHref({ q, vendor: brand.vendor, roms, page }), 301);
  }

  const { devices, total } = await fetchDevicesPage({
    q: q || undefined,
    vendor: brand?.vendor,
    hasRoms: roms || undefined,
    sort: "coverage",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) throw new Response("Not found", { status: 404 });

  const href = directoryHref({
    q: q || undefined,
    vendor: brand?.vendor,
    roms,
    page,
  });
  const isIndexable = page === 1 && !roms && !q && !brand;

  return {
    q,
    roms,
    vendor: brand?.vendor ?? null,
    vendorName: brand?.vendorName ?? null,
    brands: [...brands].sort(
      (a, b) => bySortKey(a.vendorName, b.vendorName) || 0,
    ),
    page,
    pages,
    total,
    catalogueTotal: summary.deviceCount,
    devices,
    href,
    isIndexable,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  return load(new URL(request.url));
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return load(new URL(request.url));
}

function PageLink({
  filters,
  page,
  children,
}: {
  filters: FilterState;
  page: number;
  children: string;
}) {
  return (
    <Link
      to={directoryHref({ ...filters, page })}
      prefetch="intent"
      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold outline-none transition-colors hover:border-brand/40 hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

export default function DevicesRoute() {
  const {
    q,
    roms,
    vendor,
    vendorName,
    brands,
    page,
    pages,
    total,
    catalogueTotal,
    devices,
  } = useLoaderData<typeof loader>();
  const filters: FilterState = { q, vendor, roms, page };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description={
          vendorName
            ? `${formatNumber(total)} ${vendorName} devices. Search within the brand or show only devices with ROM data.`
            : `${formatNumber(catalogueTotal)} devices. Search by name or codename, filter by brand, or show only devices with ROM data.`
        }
        endpoint={(() => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (vendor) params.set("vendor", vendor);
          params.set("sort", "coverage");
          params.set("limit", String(PAGE_SIZE));
          return `/api/devices?${params}`;
        })()}
      />

      <div className="flex flex-col gap-4">
        <Form method="get" action="/devices" className="flex gap-2">
          {vendor && <input type="hidden" name="vendor" value={vendor} />}
          {roms && <input type="hidden" name="roms" value="1" />}
          <InputGroup className="flex-1">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              key={q}
              name="q"
              type="search"
              autoComplete="off"
              spellCheck={false}
              defaultValue={q}
              placeholder="Search by device name, codename, or brand…"
              aria-label="Search devices"
            />
          </InputGroup>
          <Button type="submit">Search</Button>
        </Form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Form
              method="get"
              action="/devices"
              className="flex items-center gap-2"
            >
              {q && <input type="hidden" name="q" value={q} />}
              {roms && <input type="hidden" name="roms" value="1" />}
              <label
                htmlFor="brand-filter"
                className="text-sm font-medium text-muted-foreground"
              >
                Brand
              </label>
              <select
                id="brand-filter"
                name="vendor"
                defaultValue={vendor ?? ""}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                className="h-9 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand.vendor} value={brand.vendor}>
                    {brand.vendorName} ({formatNumber(brand.deviceCount)})
                  </option>
                ))}
              </select>
              <noscript>
                <Button type="submit" variant="outline" size="sm">
                  Apply
                </Button>
              </noscript>
            </Form>

            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
              <Link
                to={directoryHref({ q: q || undefined, vendor })}
                prefetch="intent"
                aria-current={!roms ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  !roms
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                All devices
              </Link>
              <Link
                to={directoryHref({ q: q || undefined, vendor, roms: true })}
                prefetch="intent"
                aria-current={roms ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  roms
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                With ROM data
              </Link>
            </div>
          </div>

          <p
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground tabular-nums"
          >
            {formatNumber(total)} {total === 1 ? "device" : "devices"}
            {page > 1 && ` · page ${page} of ${pages}`}
          </p>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="index-frame px-6 py-16 text-center">
          <p className="font-heading text-lg font-bold">No devices match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q
              ? `Nothing in the directory matches “${q}”.`
              : "No device matches these filters."}{" "}
            <Link
              to="/devices"
              className="font-medium text-brand hover:underline"
            >
              Clear the filters
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="index-frame">
          {devices.map((device) => (
            <li key={`${device.vendor}/${device.codename}`}>
              <DeviceRow device={device} showBrand={!vendor} />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
        >
          {page > 1 ? (
            <PageLink filters={filters} page={page - 1}>
              Previous
            </PageLink>
          ) : (
            <span className="px-3.5 py-1.5 text-sm text-muted-foreground">
              Previous
            </span>
          )}
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <PageLink filters={filters} page={page + 1}>
              Next
            </PageLink>
          ) : (
            <span className="px-3.5 py-1.5 text-sm text-muted-foreground">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
