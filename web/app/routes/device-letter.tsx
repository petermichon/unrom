import { Link, redirect, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import DeviceRow from "@/components/DeviceRow";
import { PageHeader } from "@/components/PageHeader";
import { fetchDevicesPage } from "@/lib/data";
import { isUsefulDirectoryPage } from "@/lib/indexing";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import type { Route } from "./+types/device-letter";

const PAGE_SIZE = 200;

function letterFromParam(value: string): string | null {
  if (value === "0-9") return "#";
  if (value === "other") return "other";
  const letter = value.toUpperCase();
  return /^[A-Z]$/.test(letter) ? letter : null;
}

function slugFor(letter: string): string {
  if (letter === "#") return "0-9";
  if (letter === "other") return "other";
  return letter.toLowerCase();
}

function labelFor(letter: string): string {
  if (letter === "#") return "0–9";
  if (letter === "other") return "Other";
  return letter;
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  const data = loaderData;
  if (error || !data) return errorMeta("Devices not found | unrom");
  const label = labelFor(data.letter);
  const updatedAt = updatedAtFromMatches(matches);
  const description =
    data.total === 0
      ? `No devices starting with ${label}.`
      : `${data.total} devices starting with ${label}${
          data.pages > 1 ? `, page ${data.page} of ${data.pages}` : ""
        }. Browse model names and codenames.`;

  return [
    ...pageMeta({
      title: `${label} devices | unrom`,
      description,
      path: `/devices/letter/${slugFor(data.letter)}${
        data.page > 1 ? `?page=${data.page}` : ""
      }`,
    }),
    ...modifiedMeta(updatedAt),
    ...(data.isIndexable ? [] : [{ name: "robots", content: "noindex" }]),
    ...(data.devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              `${label} devices`,
              data.devices.map((device) => ({
                name: device.name ?? device.codename,
                path: `/devices/${device.vendor}/${device.codename}`,
              })),
            ),
          },
        ]
      : []),
  ];
};

async function load(letterParam: string, request: URL) {
  const letter = letterFromParam(letterParam);
  if (!letter) throw new Response("Not found", { status: 404 });

  const canonical = slugFor(letter);
  if (letterParam !== canonical) {
    const suffix = request.search;
    throw redirect(`/devices/letter/${canonical}${suffix}`, 301);
  }

  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );
  const offset = (page - 1) * PAGE_SIZE;
  const { devices, total } = await fetchDevicesPage({
    letter,
    limit: PAGE_SIZE,
    offset,
  });
  if (devices.length === 0) {
    throw new Response("Not found", { status: 404 });
  }
  const pages = Math.ceil(total / PAGE_SIZE);
  if (page > pages) throw new Response("Not found", { status: 404 });

  const isIndexable = isUsefulDirectoryPage(
    devices.filter((device) => device.roms.length > 0).length,
  );
  return { letter, devices, total, page, pages, isIndexable };
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return load(params.letter, new URL(request.url));
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  return load(params.letter, new URL(request.url));
}

function pageHref(letter: string, page: number): string {
  const base = `/devices/letter/${slugFor(letter)}`;
  return page > 1 ? `${base}?page=${page}` : base;
}

function PageLink({
  letter,
  page,
  children,
}: {
  letter: string;
  page: number;
  children: string;
}) {
  return (
    <Link
      to={pageHref(letter, page)}
      prefetch="intent"
      className="rounded-lg border border-border/60 px-3 py-2 text-sm font-medium outline-none transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {children}
    </Link>
  );
}

export default function DeviceLetterRoute() {
  const { letter, devices, total, page, pages } =
    useLoaderData<typeof loader>();
  const label = labelFor(letter);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Devices", to: "/devices" },
          { label },
        ]}
      />

      <PageHeader
        title={`${label} devices`}
        description={
          letter === "other"
            ? `${total} device${total === 1 ? "" : "s"} with non-Latin names.`
            : `${total} device${total === 1 ? "" : "s"} starting with ${label}. ROM-covered devices first.`
        }
        endpoint={`/api/devices?letter=${encodeURIComponent(letter)}&limit=${PAGE_SIZE}`}
      />

      <ul className="flex flex-col">
        {devices.map((device) => (
          <li key={`${device.vendor}/${device.codename}`}>
            <DeviceRow device={device} />
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4"
        >
          {page > 1 ? (
            <PageLink letter={letter} page={page - 1}>
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
            <PageLink letter={letter} page={page + 1}>
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
