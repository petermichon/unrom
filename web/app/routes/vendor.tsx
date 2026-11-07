import { Link, redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRow from "@/components/DeviceRow";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevicesPage } from "@/lib/data";
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
import type { Route } from "./+types/vendor";

const PAGE_SIZE = 200;

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta("Brand not found | unrom");
  const { vendor, vendorName, devices, total, page, pages } = loaderData;
  const updatedAt = updatedAtFromMatches(matches);
  const description =
    total === 0
      ? `No ${vendorName} devices in the catalogue yet.`
      : `${total} ${vendorName} device${total === 1 ? "" : "s"}${
          pages > 1 ? `, page ${page} of ${pages}` : ""
        }, including ${summarizeNames(devices.map(deviceName), 3, total)}.`;

  return [
    ...pageMeta({
      title: `${vendorName} custom ROM devices | unrom`,
      description,
      path: `/devices/${vendor}${page > 1 ? `?page=${page}` : ""}`,
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

async function load(vendor: string, request: URL) {
  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );
  const { devices, total } = await fetchDevicesPage({
    vendor,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  if (devices.length === 0) {
    throw new Response("Not found", { status: 404 });
  }

  const canonical = devices[0].vendor;
  if (canonical !== vendor) {
    throw redirect(
      `/devices/${encodeURIComponent(canonical)}${request.search}`,
      301,
    );
  }

  const pages = Math.ceil(total / PAGE_SIZE);
  if (page > pages) throw new Response("Not found", { status: 404 });

  return {
    vendor: canonical,
    vendorName: devices[0].vendorName,
    devices,
    total,
    page,
    pages,
    isIndexable: isUsefulDirectoryPage(
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

function pageHref(vendor: string, page: number): string {
  const base = `/devices/${encodeURIComponent(vendor)}`;
  return page > 1 ? `${base}?page=${page}` : base;
}

function PageLink({
  vendor,
  page,
  children,
}: {
  vendor: string;
  page: number;
  children: string;
}) {
  return (
    <Link
      to={pageHref(vendor, page)}
      prefetch="intent"
      className="rounded-lg border border-border/60 px-3 py-2 text-sm font-medium outline-none transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

export default function VendorRoute() {
  const { vendor, vendorName, devices, total, page, pages } =
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
        description={`${total} device${total === 1 ? "" : "s"}. ROM-covered devices first.`}
        endpoint={`/api/devices?vendor=${vendor}&limit=${PAGE_SIZE}`}
      />

      <ul className="flex flex-col">
        {devices.map((device) => (
          <li key={`${device.vendor}/${device.codename}`}>
            <DeviceRow device={device} showBrand={false} />
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4"
        >
          {page > 1 ? (
            <PageLink vendor={vendor} page={page - 1}>
              Previous
            </PageLink>
          ) : (
            <span
              aria-disabled="true"
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              Previous
            </span>
          )}
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <PageLink vendor={vendor} page={page + 1}>
              Next
            </PageLink>
          ) : (
            <span
              aria-disabled="true"
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
