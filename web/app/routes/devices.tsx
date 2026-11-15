import { Link, redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRow from "@/components/DeviceRow";
import { PageHeader } from "@/components/PageHeader";
import {
  BrandPicker,
  CoverageToggle,
  DirectoryPager,
  DirectorySearch,
  FilterToggle,
} from "@/components/directory";
import { fetchBrands, fetchDevicesPage, fetchSummary } from "@/lib/data";
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

const PAGE_SIZE = 200;

const UPDATED_DAYS = 90;

function directoryHref({
  q,
  roms,
  relock,
  updated,
  hardened,
  page,
}: {
  q?: string;
  roms?: boolean;
  relock?: boolean;
  updated?: boolean;
  hardened?: boolean;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (roms) params.set("roms", "1");
  if (relock) params.set("relock", "supported");
  if (updated) params.set("updated", String(UPDATED_DAYS));
  if (hardened) params.set("hardened", "1");
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

  // Letter pages and the old ?vendor= filter now live on the brand pages.
  if (request.searchParams.has("letter")) {
    throw redirect("/devices", 301);
  }

  const [summary, brands] = await Promise.all([fetchSummary(), fetchBrands()]);

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
    sort: "roms",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) throw new Response("Not found", { status: 404 });

  const href = directoryHref({
    q: q || undefined,
    roms,
    relock,
    updated,
    hardened,
    page,
  });

  return {
    q,
    roms,
    relock,
    updated,
    hardened,
    page,
    pages,
    total,
    catalogueTotal: summary.deviceCount,
    devices,
    href,
    brands: [...brands].sort(
      (a, b) => bySortKey(a.vendorName, b.vendorName) || 0,
    ),
    isIndexable: page === 1 && !roms && !relock && !updated && !hardened && !q,
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
    page,
    pages,
    total,
    catalogueTotal,
    devices,
    brands,
  } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description={`${formatNumber(catalogueTotal)} devices. Search by name or codename, filter by brand, or show only devices with ROM data.`}
        endpoint={(() => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          if (roms) params.set("hasRoms", "true");
          if (relock) params.set("relock", "supported");
          if (updated) params.set("updated", String(UPDATED_DAYS));
          if (hardened) params.set("hardened", "1");
          params.set("sort", "roms");
          params.set("limit", String(PAGE_SIZE));
          if (page > 1) params.set("offset", String((page - 1) * PAGE_SIZE));
          return `/api/devices?${params}`;
        })()}
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
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
              })}
              romsHref={directoryHref({
                q: q || undefined,
                roms: true,
                relock,
                updated,
                hardened,
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
              })}
              active={hardened}
              label="Hardened"
            />
            <FilterToggle
              href={directoryHref({
                q: q || undefined,
                roms,
                relock,
                updated: !updated,
                hardened,
              })}
              active={updated}
              label="Recently updated"
            />
            <FilterToggle
              href={directoryHref({
                q: q || undefined,
                roms,
                relock: !relock,
                updated,
                hardened,
              })}
              active={relock}
              label="Relock supported"
            />
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

        {/* Filters whose facts the sources do not publish yet, so there is
            nothing to click: stated as intent, not as a control. */}
        <p className="text-xs text-muted-foreground">
          Planned filters: Official builds (official or unofficial per build) ·
          Long support (vendor end dates) · Legacy (follows those dates)
        </p>
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
              <DeviceRow device={device} />
            </li>
          ))}
        </ul>
      )}

      <DirectoryPager
        page={page}
        pages={pages}
        prevHref={
          page > 1
            ? directoryHref({
                q: q || undefined,
                roms,
                relock,
                updated,
                hardened,
                page: page - 1,
              })
            : null
        }
        nextHref={
          page < pages
            ? directoryHref({
                q: q || undefined,
                roms,
                relock,
                updated,
                hardened,
                page: page + 1,
              })
            : null
        }
      />
    </div>
  );
}
