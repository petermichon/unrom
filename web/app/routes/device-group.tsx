import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceDirectoryList from "@/components/DeviceDirectoryList";
import { PageHeader } from "@/components/PageHeader";
import {
  DirectoryPager,
  DirectorySearch,
  FilterToggle,
} from "@/components/directory";
import { fetchDevicesPage } from "@/lib/data";
import {
  DEVICE_GROUPS,
  GROUP_PAGE_SIZE,
  deviceGroup,
  groupHref,
} from "@/lib/device-groups";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/device-group";

async function load(groupId: string, request: URL) {
  const group = deviceGroup(groupId);
  if (!group) throw new Response("Not found", { status: 404 });

  const q = (request.searchParams.get("q") ?? "").trim();
  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );

  const { devices, total } = await fetchDevicesPage({
    ...group.filters,
    q: q || undefined,
    sort: "roms",
    limit: GROUP_PAGE_SIZE,
    offset: (page - 1) * GROUP_PAGE_SIZE,
  });

  const pages = Math.max(1, Math.ceil(total / GROUP_PAGE_SIZE));
  if (page > pages) throw new Response("Not found", { status: 404 });

  return {
    group,
    q,
    page,
    pages,
    total,
    devices,
    href: groupHref(group, { q: q || undefined, page }),
    isIndexable: page === 1 && !q && total > 0,
  };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return load(params.group, new URL(request.url));
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  return load(params.group, new URL(request.url));
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta();
  const { group, q, total, devices, isIndexable } = loaderData;

  return [
    ...pageMeta({
      title: q ? `${group.heading} matching “${q}” | unrom` : group.title,
      description: q
        ? `${formatNumber(total)} devices match “${q}” in the ${group.name} group of the unrom directory.`
        : group.description,
      // Search and page 2+ views are not canonical; the group page is.
      path: group.path,
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
    ...(isIndexable ? [] : [{ name: "robots", content: "noindex" }]),
    ...(devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              group.heading,
              devices.map((device) => ({
                name: device.name ?? device.codename,
                path: `/devices/${device.vendor}/${device.codename}`,
              })),
            ),
          },
        ]
      : []),
  ];
};

export default function DeviceGroupRoute() {
  const { group, q, page, pages, total, devices } =
    useLoaderData<typeof loader>();

  const allDevicesHref = q
    ? `/devices?${new URLSearchParams({ q }).toString()}`
    : "/devices";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Device groups", to: "/device-groups" },
          { label: group.name },
        ]}
      />

      <PageHeader title={group.heading} description={group.description} />

      <div className="flex flex-col gap-4">
        <DirectorySearch action={group.path} q={q} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterToggle
              href={allDevicesHref}
              active={false}
              label="All devices"
            />
            {DEVICE_GROUPS.map((item) => (
              <FilterToggle
                key={item.id}
                href={groupHref(item, { q: q || undefined })}
                active={item.id === group.id}
                label={item.name}
              />
            ))}
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
              ? `Nothing in this group matches “${q}”.`
              : "This group is empty."}{" "}
            <Link
              to={group.path}
              className="font-medium text-foreground hover:underline"
            >
              Clear the search
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
        prevHref={
          page > 1
            ? groupHref(group, { q: q || undefined, page: page - 1 })
            : null
        }
        nextHref={
          page < pages
            ? groupHref(group, { q: q || undefined, page: page + 1 })
            : null
        }
      />
    </div>
  );
}
