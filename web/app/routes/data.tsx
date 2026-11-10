import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchApiIndex,
  fetchBrands,
  fetchExportSizes,
  fetchMeta,
  fetchSummary,
} from "@/lib/data";
import {
  errorMeta,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { formatNumber } from "@/lib/utils";
import type { Route } from "./+types/data";

const REPO_URL = "https://github.com/petermichon/unrom";
const ODBL_URL = "https://opendatacommons.org/licenses/odbl/1-0/";

async function load() {
  const [summary, meta, api, brands, exports] = await Promise.all([
    fetchSummary(),
    fetchMeta(),
    // The endpoint index is presentation only. A proxy or routing problem that
    // breaks bare /api must not take the whole dataset page down with it.
    fetchApiIndex().catch(() => null),
    fetchBrands(),
    fetchExportSizes(),
  ]);

  return {
    counts: {
      devices: summary.deviceCount,
      brands: summary.brandCount,
      roms: summary.romCount,
      coveredRoms: summary.coveredRomCount,
      coveredDevices: brands.reduce((sum, brand) => sum + brand.withRoms, 0),
    },
    meta,
    endpoints: api?.endpoints ?? [],
    exports,
  };
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta("Data not found | unrom");
  const counts = loaderData?.counts;

  return [
    ...pageMeta({
      title: "Android ROM dataset: downloads and API | unrom",
      description: counts
        ? `Download the open unrom dataset as JSON or SQLite, or use the API. ${formatNumber(counts.devices)} devices, ${formatNumber(counts.brands)} brands, ${formatNumber(counts.roms)} ROMs, ${formatNumber(counts.coveredRoms)} with device data.`
        : "Download the open unrom dataset as JSON or SQLite, or use the REST API.",
      path: "/data",
    }),
    ...modifiedMeta(updatedAtFromMatches(matches)),
  ];
};

export async function loader() {
  return load();
}

export async function clientLoader() {
  return load();
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "unknown";
  // Fixed locale + UTC so the server and client render identically.
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "Size unavailable";
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function StatRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="max-w-[68ch] text-sm text-muted-foreground">{label}</dt>
      <dd className="shrink-0 text-right text-sm font-semibold tabular-nums">
        {value}
        {note && (
          <span className="ml-2 font-normal text-muted-foreground">{note}</span>
        )}
      </dd>
    </div>
  );
}

function percent(part: number, whole: number): string {
  if (whole <= 0) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function DownloadCard({
  title,
  description,
  href,
  filename,
  size,
}: {
  title: string;
  description: string;
  href: string;
  filename: string;
  size: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatBytes(size)}
        </span>
        <Button
          nativeButton={false}
          render={
            <a
              href={href}
              download={filename}
              aria-label={`Download ${title}`}
            />
          }
        >
          Download {title}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DataRoute() {
  const { counts, meta, endpoints, exports } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Data" }]} />

      <PageHeader
        title="Data"
        description="The open dataset behind unrom: device–ROM compatibility, available as JSON, SQLite, and a REST API."
        endpoint="/api"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Catalogue</p>
          <dl className="divide-y divide-border/60 border-y border-border/60">
            <StatRow label="Devices" value={formatNumber(counts.devices)} />
            <StatRow label="Brands" value={formatNumber(counts.brands)} />
            <StatRow label="ROMs" value={formatNumber(counts.roms)} />
          </dl>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">Coverage</p>
          <dl className="divide-y divide-border/60 border-y border-border/60">
            <StatRow
              label="Devices with ROM data"
              value={formatNumber(counts.coveredDevices)}
              note={`${percent(counts.coveredDevices, counts.devices)} of devices`}
            />
            <StatRow
              label="ROMs with device data"
              value={formatNumber(counts.coveredRoms)}
              note={`${percent(counts.coveredRoms, counts.roms)} of ROMs`}
            />
          </dl>
        </div>
      </div>

      <section aria-labelledby="downloads" className="flex flex-col gap-3">
        <h2
          id="downloads"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Downloads
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <DownloadCard
            title="JSON"
            description="One file with devices, ROMs, and mappings."
            href="/api/export/json"
            filename="unrom.json"
            size={exports.json}
          />
          <DownloadCard
            title="SQLite"
            description="A single database for local queries."
            href="/api/export/sqlite"
            filename="unrom.sqlite"
            size={exports.sqlite}
          />
        </div>
      </section>

      <section aria-labelledby="api" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="api"
            className="font-heading text-xl font-bold tracking-tight"
          >
            API
          </h2>
          <div className="flex gap-3 text-sm">
            <a
              href="/api"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              API index
            </a>
            <a
              href="/api/openapi.json"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              OpenAPI
            </a>
          </div>
        </div>
        <p className="max-w-[68ch] text-sm text-muted-foreground">
          No key and no authentication. Device lists paginate with{" "}
          <code>limit</code> and <code>offset</code> (maximum 200) and return
          the total in <code>x-total-count</code>. Response shapes are frozen in{" "}
          <code>contract/</code>.
        </p>
        <ul className="index-frame">
          {endpoints.length > 0 ? (
            endpoints.map((endpoint) => {
              const [method, ...rest] = endpoint.split(" ");
              const path = rest.join(" ");
              return (
                <li
                  key={endpoint}
                  className="flex flex-wrap items-baseline gap-3 px-4 py-2"
                >
                  <span className="w-8 font-mono text-xs text-muted-foreground">
                    {method}
                  </span>
                  <code className="font-mono text-sm">{path}</code>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-2 text-sm text-muted-foreground">
              The endpoint list is unavailable right now. The OpenAPI document
              still describes every route.
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="contents" className="flex flex-col gap-3">
        <h2
          id="contents"
          className="font-heading text-xl font-bold tracking-tight"
        >
          What is in the dataset
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Entities</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Vendors and their devices.</li>
              <li>Devices with codenames, model names, and aliases.</li>
              <li>ROMs and their status.</li>
              <li>Device–ROM mappings with a source URL.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold">Fields</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Names, codenames, aliases, and build groups.</li>
              <li>ROM status and per-device build references.</li>
              <li>Name confidence and the sources behind it.</li>
            </ul>
          </div>
        </div>
        <p className="max-w-[68ch] text-sm text-muted-foreground">
          Not included: ROM downloads, device specifications, or install
          instructions. Catalogue-only ROMs have no device data yet.
        </p>
      </section>

      <section aria-labelledby="provenance" className="flex flex-col gap-3">
        <h2
          id="provenance"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Provenance and license
        </h2>
        <p className="max-w-[68ch] text-sm text-muted-foreground">
          Each mapping keeps the source URL it came from. Device lists are read
          from ROM projects&apos; own sources, with catalogue coverage from
          ROMDB.tel, Customrombay, and the awesome list. Raw snapshots live in{" "}
          <code>data/</code>.
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <li>
            <a
              href={`${REPO_URL}/blob/main/ATTRIBUTION.md`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Attribution
            </a>
          </li>
          <li>
            <a
              href={`${REPO_URL}/blob/main/ROM_DATA_SOURCES.md`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Data sources
            </a>
          </li>
          <li>
            <a
              href={ODBL_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              ODbL-1.0
            </a>
          </li>
          <li>
            <a
              href={`${REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              AGPL-3.0-only
            </a>
          </li>
          <li>
            <Link
              to="/legal"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Legal notice
            </Link>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Data is ODbL-1.0 and code is AGPL-3.0-only. Android is a trademark of
          Google LLC. Other names belong to their owners and are used for
          identification only.
        </p>
      </section>

      <section aria-labelledby="freshness" className="flex flex-col gap-3">
        <h2
          id="freshness"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Freshness
        </h2>
        <p className="max-w-[68ch] text-sm text-muted-foreground">
          The dataset is rebuilt from the snapshots in <code>data/</code>. The
          content hash changes when the data changes.
        </p>
        <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">Last built</dt>
          <dd>
            <time dateTime={meta.generatedAt}>
              {formatDate(meta.generatedAt)}
            </time>
          </dd>
          <dt className="text-muted-foreground">Content hash</dt>
          <dd>
            <code className="break-all font-mono text-xs">
              {meta.contentHash}
            </code>
          </dd>
        </dl>
      </section>

      <section aria-labelledby="corrections" className="flex flex-col gap-3">
        <h2
          id="corrections"
          className="font-heading text-xl font-bold tracking-tight"
        >
          Corrections
        </h2>
        <p className="max-w-[68ch] text-sm text-muted-foreground">
          Found a wrong mapping or a missing device? Open an issue or read the
          contribution guide. Changes require a DCO sign-off.
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <li>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Open an issue
            </a>
          </li>
          <li>
            <a
              href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Contributing
            </a>
          </li>
          <li>
            <Link
              to="/devices"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Browse devices
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
