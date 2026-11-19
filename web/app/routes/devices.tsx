import { useEffect, useRef } from "react";
import { Link, redirect, useLoaderData, useLocation } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceDirectoryList from "@/components/DeviceDirectoryList";
import { DirectoryFilterBar } from "@/components/DirectoryFilterBar";
import { PageHeader } from "@/components/PageHeader";
import {
  BrandPicker,
  CoverageToggle,
  DirectoryPager,
  DirectorySearch,
  FilterToggle,
  SortToggle,
} from "@/components/directory";
import { DIRECTORY_PAGE_SIZE, fetchBrands, fetchDevicesPage } from "@/lib/data";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { bySortKey } from "@/lib/sort";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/devices";

const UPDATED_DAYS = 90;

type SortKey = "roms" | "name";

function directoryHref({
  q,
  roms,
  relock,
  updated,
  hardened,
  sort,
  page,
}: {
  q?: string;
  roms?: boolean;
  relock?: boolean;
  updated?: boolean;
  hardened?: boolean;
  sort?: SortKey;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (roms) params.set("roms", "1");
  if (relock) params.set("relock", "supported");
  if (updated) params.set("updated", String(UPDATED_DAYS));
  if (hardened) params.set("hardened", "1");
  if (sort === "name") params.set("sort", "name");
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/devices?${search}` : "/devices";
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta();
  const { q, total, isIndexable } = loaderData;

  return [
    ...pageMeta({
      title: q
        ? `Devices matching “${q}” | unrom`
        : "Android devices and ROM support | unrom",
      description: q
        ? `${formatNumber(total)} devices match “${q}” in the unrom directory.`
        : `${formatNumber(total)} devices. Search by name or codename, filter by brand, or show only devices with ROM data.`,
      path: loaderData.href,
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
    ...(isIndexable ? [] : [{ name: "robots", content: "noindex" }]),
    ...(loaderData.devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              q ? `Devices matching ${q}` : "Devices",
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
  const relockRaw = request.searchParams.get("relock");
  const relock = relockRaw === "supported";
  const updated = Number(request.searchParams.get("updated")) === UPDATED_DAYS;
  const hardened = request.searchParams.get("hardened") === "1";
  const sortRaw = request.searchParams.get("sort");
  const sort: SortKey = sortRaw === "name" ? "name" : "roms";
  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );

  if (relockRaw !== null && relockRaw !== "supported") {
    throw new Response("Not found", { status: 404 });
  }
  if (request.searchParams.has("updated") && !updated) {
    throw new Response("Not found", { status: 404 });
  }
  if (sortRaw !== null && sortRaw !== "roms" && sortRaw !== "name") {
    throw new Response("Not found", { status: 404 });
  }

  // Letter pages and the old ?vendor= filter now live on the brand pages.
  if (request.searchParams.has("letter")) {
    throw redirect("/devices", 301);
  }

  const brands = await fetchBrands();

  if (rawVendor) {
    const brand = brands.find(
      (entry) => entry.vendor === rawVendor.toLowerCase(),
    );
    if (!brand) throw new Response("Not found", { status: 404 });
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (roms) params.set("roms", "1");
    if (relock) params.set("relock", "supported");
    if (updated) params.set("updated", String(UPDATED_DAYS));
    if (hardened) params.set("hardened", "1");
    if (sort === "name") params.set("sort", "name");
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    throw redirect(
      `/devices/${brand.vendor}${search ? `?${search}` : ""}`,
      301,
    );
  }

  const { devices, total } = await fetchDevicesPage({
    q: q || undefined,
    hasRoms: roms || undefined,
    relock: relock ? "supported" : undefined,
    updatedWithinDays: updated ? UPDATED_DAYS : undefined,
    hardened: hardened || undefined,
    sort,
    limit: DIRECTORY_PAGE_SIZE,
    offset: (page - 1) * DIRECTORY_PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  if (page > pages) throw new Response("Not found", { status: 404 });

  const href = directoryHref({
    q: q || undefined,
    roms,
    relock,
    updated,
    hardened,
    sort,
    page,
  });

  return {
    q,
    roms,
    relock,
    updated,
    hardened,
    sort,
    page,
    pages,
    total,
    devices,
    href,
    brands: [...brands].sort(
      (a, b) => bySortKey(a.vendorName, b.vendorName) || 0,
    ),
    isIndexable:
      page === 1 &&
      sort === "roms" &&
      !roms &&
      !relock &&
      !updated &&
      !hardened &&
      !q,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  return load(new URL(request.url));
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return load(new URL(request.url));
}

export default function DevicesRoute() {
  const {
    q,
    roms,
    relock,
    updated,
    hardened,
    sort,
    page,
    pages,
    total,
    devices,
    brands,
  } = useLoaderData<typeof loader>();
  const location = useLocation();
  const resultsRef = useRef<HTMLParagraphElement>(null);
  const initialSearch = useRef(location.search);

  // A filter or search changes the list in place; move focus to the new count
  // so keyboard and screen-reader users land on the result, not the old link.
  useEffect(() => {
    if (location.search === initialSearch.current) return;
    resultsRef.current?.focus();
  }, [location.search]);

  const hasFilters = roms || relock || updated || hardened;
  const activeFilterCount = [roms, relock, updated, hardened].filter(
    Boolean,
  ).length;
  const first = total === 0 ? 0 : (page - 1) * DIRECTORY_PAGE_SIZE + 1;
  const last = total === 0 ? 0 : first + devices.length - 1;
  const clearLabel =
    q && hasFilters
      ? "Clear search and filters"
      : q
        ? "Clear search"
        : "Clear filters";

  const prevHref =
    page > 1
      ? directoryHref({
          q: q || undefined,
          roms,
          relock,
          updated,
          hardened,
          sort,
          page: page - 1,
        })
      : null;
  const nextHref =
    page < pages
      ? directoryHref({
          q: q || undefined,
          roms,
          relock,
          updated,
          hardened,
          sort,
          page: page + 1,
        })
      : null;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description="Find your device to see which custom ROMs support it."
      />

      <div className="flex flex-col gap-4">
        <DirectorySearch
          action="/devices"
          q={q}
          hidden={{
            roms: roms ? "1" : undefined,
            relock: relock ? "supported" : undefined,
            updated: updated ? String(UPDATED_DAYS) : undefined,
            hardened: hardened ? "1" : undefined,
            sort: sort === "name" ? "name" : undefined,
          }}
        />

        <DirectoryFilterBar activeCount={activeFilterCount}>
          <BrandPicker
            brands={brands}
            q={q}
            roms={roms}
            relock={relock}
            updated={updated}
            hardened={hardened}
          />
          <CoverageToggle
            allHref={directoryHref({
              q: q || undefined,
              relock,
              updated,
              hardened,
              sort,
            })}
            romsHref={directoryHref({
              q: q || undefined,
              roms: true,
              relock,
              updated,
              hardened,
              sort,
            })}
            roms={roms}
          />
          <FilterToggle
            href={directoryHref({
              q: q || undefined,
              roms,
              relock,
              updated,
              hardened: !hardened,
              sort,
            })}
            active={hardened}
            label="Hardened"
            hint="A ROM documents security patches, exploit mitigations and relock support"
          />
          <FilterToggle
            href={directoryHref({
              q: q || undefined,
              roms,
              relock,
              updated: !updated,
              hardened,
              sort,
            })}
            active={updated}
            label="Recently updated"
            hint="A ROM build published in the last 90 days"
          />
          <FilterToggle
            href={directoryHref({
              q: q || undefined,
              roms,
              relock: !relock,
              updated,
              hardened,
              sort,
            })}
            active={relock}
            label="Relock supported"
            hint="A ROM documents a bootloader relock path"
          />
        </DirectoryFilterBar>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p
              ref={resultsRef}
              role="status"
              aria-live="polite"
              tabIndex={-1}
              className="text-sm text-muted-foreground tabular-nums outline-none"
            >
              {total === 0 ? (
                "0 devices"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-mono">
                    {formatNumber(first)}–{formatNumber(last)}
                  </span>{" "}
                  of <span className="font-mono">{formatNumber(total)}</span>
                  {hasFilters || q ? " matching" : ""} devices
                </>
              )}
            </p>
            {(q || hasFilters) && (
              <Link
                to="/devices"
                className="text-sm font-medium text-foreground hover:underline"
              >
                {clearLabel}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              Sort
            </span>
            <SortToggle
              romsHref={directoryHref({
                q: q || undefined,
                roms,
                relock,
                updated,
                hardened,
              })}
              nameHref={directoryHref({
                q: q || undefined,
                roms,
                relock,
                updated,
                hardened,
                sort: "name",
              })}
              sort={sort}
            />
            {pages > 1 && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
                Page {page} of {pages}
                {prevHref && (
                  <Link
                    to={prevHref}
                    prefetch="intent"
                    aria-label="Previous page"
                    className="inline-flex h-8 items-center font-semibold text-foreground hover:underline"
                  >
                    Prev
                  </Link>
                )}
                {nextHref && (
                  <Link
                    to={nextHref}
                    prefetch="intent"
                    aria-label="Next page"
                    className="inline-flex h-8 items-center font-semibold text-foreground hover:underline"
                  >
                    Next
                  </Link>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <p className="font-heading text-lg font-bold">No devices match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q
              ? `Nothing in the directory matches “${q}”${
                  hasFilters ? " with these filters" : ""
                }.`
              : "No device matches these filters."}{" "}
            <Link
              to="/devices"
              className="font-medium text-foreground hover:underline"
            >
              {clearLabel}
            </Link>
            .
          </p>
        </div>
      ) : (
        <DeviceDirectoryList devices={devices} />
      )}

      <DirectoryPager
        page={page}
        pages={pages}
        prevHref={prevHref}
        nextHref={nextHref}
      />
    </div>
  );
}
