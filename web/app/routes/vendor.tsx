import { Link, redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRow from "@/components/DeviceRow";
import { PageHeader } from "@/components/PageHeader";
import {
  BrandPicker,
  CoverageToggle,
  DirectoryPager,
  DirectorySearch,
} from "@/components/directory";
import { fetchBrands, fetchDevicesPage } from "@/lib/data";
import { isUsefulDirectoryPage } from "@/lib/indexing";
import { deviceName } from "@/lib/devices";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  summarizeNames,
  updatedAtFromMatches,
} from "@/lib/seo";
import { bySortKey } from "@/lib/sort";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/vendor";

const PAGE_SIZE = 200;

function vendorHref(
  vendor: string,
  {
    q,
    roms,
    page,
  }: {
    q?: string;
    roms?: boolean;
    page?: number;
  },
): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (roms) params.set("roms", "1");
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return `/devices/${encodeURIComponent(vendor)}${search ? `?${search}` : ""}`;
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta("Brand not found | unrom");
  const { vendorName, devices, total, page, pages } = loaderData;
  const updatedAt = updatedAtFromMatches(matches);
  const description =
    total === 0
      ? `No ${vendorName} devices match this search.`
      : `${formatNumber(total)} ${vendorName} device${total === 1 ? "" : "s"}${
          pages > 1 ? `, page ${page} of ${pages}` : ""
        }, including ${summarizeNames(devices.map(deviceName), 3, total)}.`;

  return [
    ...pageMeta({
      title: `${vendorName} custom ROM devices | unrom`,
      description,
      path: loaderData.href,
    }),
    ...modifiedMeta(updatedAt),
    ...(loaderData.isIndexable ? [] : [{ name: "robots", content: "noindex" }]),
    ...(devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              `${vendorName} devices`,
              devices.map((device) => ({
                name: deviceName(device),
                path: `/devices/${device.vendor}/${device.codename}`,
              })),
            ),
          },
        ]
      : []),
  ];
};

async function load(vendorParam: string, request: URL) {
  const q = (request.searchParams.get("q") ?? "").trim();
  const roms = request.searchParams.get("roms") === "1";
  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );

  const brands = await fetchBrands();
  const brand = brands.find(
    (entry) => entry.vendor === vendorParam.toLowerCase(),
  );
  if (!brand) throw new Response("Not found", { status: 404 });
  if (brand.vendor !== vendorParam) {
    throw redirect(`/devices/${brand.vendor}${request.search}`, 301);
  }

  const { devices, total } = await fetchDevicesPage({
    vendor: brand.vendor,
    q: q || undefined,
    hasRoms: roms || undefined,
    sort: "coverage",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) throw new Response("Not found", { status: 404 });

  const href = vendorHref(brand.vendor, {
    q: q || undefined,
    roms,
    page,
  });

  return {
    vendor: brand.vendor,
    vendorName: brand.vendorName,
    brands: [...brands].sort(
      (a, b) => bySortKey(a.vendorName, b.vendorName) || 0,
    ),
    q,
    roms,
    devices,
    total,
    page,
    pages,
    href,
    isIndexable:
      page === 1 &&
      !q &&
      !roms &&
      isUsefulDirectoryPage(
        devices.filter((device) => device.roms.length > 0).length,
      ),
  };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return load(params.vendor, new URL(request.url));
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  return load(params.vendor, new URL(request.url));
}

export default function VendorRoute() {
  const { vendor, vendorName, brands, q, roms, devices, total, page, pages } =
    useLoaderData<typeof loader>();

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
        description={`${formatNumber(total)} ${vendorName} device${total === 1 ? "" : "s"}. Search within the brand or show only devices with ROM data.`}
        endpoint={(() => {
          const params = new URLSearchParams();
          params.set("vendor", vendor);
          if (q) params.set("q", q);
          if (roms) params.set("hasRoms", "true");
          params.set("sort", "coverage");
          params.set("limit", String(PAGE_SIZE));
          return `/api/devices?${params}`;
        })()}
      />

      <div className="flex flex-col gap-4">
        <DirectorySearch
          action={vendorHref(vendor, {})}
          q={q}
          placeholder={`Search ${vendorName} devices by name or codename…`}
          hidden={{ roms: roms ? "1" : undefined }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <BrandPicker brands={brands} current={vendor} q={q} roms={roms} />
            <CoverageToggle
              allHref={vendorHref(vendor, { q: q || undefined })}
              romsHref={vendorHref(vendor, { q: q || undefined, roms: true })}
              roms={roms}
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
      </div>

      {devices.length === 0 ? (
        <div className="index-frame px-6 py-16 text-center">
          <p className="font-heading text-lg font-bold">No devices match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q
              ? `Nothing from ${vendorName} matches “${q}”.`
              : "No device matches these filters."}{" "}
            <Link
              to={vendorHref(vendor, {})}
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
              <DeviceRow device={device} showBrand={false} />
            </li>
          ))}
        </ul>
      )}

      <DirectoryPager
        page={page}
        pages={pages}
        prevHref={
          page > 1
            ? vendorHref(vendor, { q: q || undefined, roms, page: page - 1 })
            : null
        }
        nextHref={
          page < pages
            ? vendorHref(vendor, { q: q || undefined, roms, page: page + 1 })
            : null
        }
      />
    </div>
  );
}
