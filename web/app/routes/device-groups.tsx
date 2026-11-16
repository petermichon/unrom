import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevicesPage } from "@/lib/data";
import {
  DEVICE_GROUPS,
  GROUPS_DESCRIPTION,
  GROUPS_TITLE,
} from "@/lib/device-groups";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/device-groups";

async function load() {
  const groups = await Promise.all(
    DEVICE_GROUPS.map(async (group) => {
      const { total } = await fetchDevicesPage({
        ...group.filters,
        sort: "roms",
        limit: 1,
        offset: 0,
      });
      return {
        id: group.id,
        name: group.name,
        path: group.path,
        summary: group.summary,
        total,
      };
    }),
  );
  return { groups };
}

export async function loader() {
  return load();
}

export async function clientLoader() {
  return load();
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta();

  return [
    ...pageMeta({
      title: GROUPS_TITLE,
      description: GROUPS_DESCRIPTION,
      path: "/device-groups",
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
    {
      "script:ld+json": itemListLd(
        "Device groups",
        loaderData.groups.map((group) => ({
          name: group.name,
          path: group.path,
        })),
      ),
    },
  ];
};

export default function DeviceGroupsRoute() {
  const { groups } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Device groups" }]}
      />

      <PageHeader title="Device groups" description={GROUPS_DESCRIPTION} />

      <ul className="index-frame">
        {groups.map((group) => (
          <li key={group.id}>
            <Link to={group.path} prefetch="intent" className="index-row">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{group.name}</span>
                <span className="text-xs text-muted-foreground">
                  {group.summary}
                </span>
              </span>
              <span className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {formatNumber(group.total)}{" "}
                {group.total === 1 ? "device" : "devices"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
