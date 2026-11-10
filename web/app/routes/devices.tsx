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
import { fetchDeviceLetters, fetchDevicesPage } from "@/lib/data";
import { isUsefulDirectoryPage } from "@/lib/indexing";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { cn, formatNumber } from "@/lib/utils";
import type { LetterSummary } from "@/lib/types";
import type { Route } from "./+types/devices";

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

interface FilterState {
  q: string;
  letter: string | null;
  roms: boolean;
  page: number;
}

/** Canonical directory URL for a filter state. */
function directoryHref(filters: Partial<FilterState>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.letter) params.set("letter", slugFor(filters.letter));
  if (filters.roms) params.set("roms", "1");
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));
  const search = params.toString();
  return search ? `/devices?${search}` : "/devices";
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error || !loaderData) return errorMeta();
  const { q, letter, total, page, pages, isIndexable } = loaderData;
  const label = letter ? labelFor(letter) : null;

  return [
    ...pageMeta({
      title: q
        ? `Devices matching “${q}” | unrom`
        : label
          ? `${label} devices | unrom`
          : "Android devices and ROM support | unrom",
      description: q
        ? `${formatNumber(total)} devices match “${q}” in the unrom directory.`
        : label
          ? `Browse model names and codenames for ${formatNumber(total)} devices starting with ${label}${
              page > 1 ? `, page ${page} of ${pages}` : ""
            }.`
          : `${formatNumber(total)} devices. Browse by letter, filter to devices with ROM data, or search by name or codename.`,
      path: directoryHref({
        q: q || undefined,
        letter,
        roms: loaderData.roms,
        page,
      }),
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
    ...(isIndexable ? [] : [{ name: "robots", content: "noindex" }]),
    ...(loaderData.devices.length > 0
      ? [
          {
            "script:ld+json": itemListLd(
              q ? `Devices matching ${q}` : (label ?? "Devices"),
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
  const rawLetter = request.searchParams.get("letter") || null;
  const letter = rawLetter === null ? null : letterFromParam(rawLetter);
  if (rawLetter !== null && letter === null) {
    throw new Response("Not found", { status: 404 });
  }
  if (letter !== null && rawLetter !== slugFor(letter)) {
    const params = new URLSearchParams(request.searchParams);
    params.set("letter", slugFor(letter));
    throw redirect(`/devices?${params}`, 301);
  }

  const q = (request.searchParams.get("q") ?? "").trim();
  const roms = request.searchParams.get("roms") === "1";
  const page = Math.max(
    1,
    Math.trunc(Number(request.searchParams.get("page")) || 1),
  );

  const [{ devices, total }, letters] = await Promise.all([
    fetchDevicesPage({
      q: q || undefined,
      letter: letter ?? undefined,
      hasRoms: roms || undefined,
      sort: "coverage",
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    fetchDeviceLetters(),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) throw new Response("Not found", { status: 404 });

  const letterSummary = letter
    ? letters.find((entry) => entry.letter === letter)
    : undefined;
  const isIndexable =
    page === 1 &&
    !roms &&
    !q &&
    (letter === null || isUsefulDirectoryPage(letterSummary?.withRoms ?? 0));

  return {
    q,
    letter,
    roms,
    page,
    pages,
    total,
    devices,
    letters,
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

function LetterRail({
  letters,
  current,
  roms,
}: {
  letters: LetterSummary[];
  current: string | null;
  roms: boolean;
}) {
  return (
    <nav aria-label="Filter by letter" className="flex flex-wrap gap-1.5">
      <Link
        to={directoryHref({ roms })}
        prefetch="intent"
        aria-current={current === null ? "page" : undefined}
        className={cn(
          "flex h-8 items-center justify-center rounded-full border px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
          current === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
        )}
      >
        All
      </Link>
      {letters.map(({ letter }) => {
        const isCurrent = letter === current;
        return (
          <Link
            key={letter}
            to={directoryHref({ letter, roms })}
            prefetch="intent"
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              isCurrent
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground",
            )}
          >
            {labelFor(letter)}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DevicesRoute() {
  const { q, letter, roms, page, pages, total, devices, letters } =
    useLoaderData<typeof loader>();
  const filters: FilterState = { q, letter, roms, page };
  const catalogueTotal = letters.reduce(
    (sum, entry) => sum + entry.deviceCount,
    0,
  );
  const apiParams = new URLSearchParams();
  if (q) apiParams.set("q", q);
  if (letter) apiParams.set("letter", slugFor(letter));
  if (roms) apiParams.set("hasRoms", "true");
  apiParams.set("sort", "coverage");
  apiParams.set("limit", String(PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Devices" }]} />

      <PageHeader
        title="Devices"
        description={`${formatNumber(catalogueTotal)} devices. Search by name or codename, filter by letter, or show only devices with ROM data.`}
        endpoint={`/api/devices?${apiParams}`}
      />

      <div className="flex flex-col gap-4">
        <Form method="get" action="/devices" className="flex gap-2">
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

        <LetterRail letters={letters} current={letter} roms={roms} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <Link
              to={directoryHref({ q: q || undefined, letter })}
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
              to={directoryHref({ q: q || undefined, letter, roms: true })}
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
              <DeviceRow device={device} />
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
