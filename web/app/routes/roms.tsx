import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { fetchRoms, seedRoms } from "@/lib/data";
import { matchesAll, tokenize } from "@/lib/search";
import {
  errorMeta,
  itemListLd,
  modifiedMeta,
  pageMeta,
  updatedAtFromMatches,
} from "@/lib/seo";
import { bySortKey } from "@/lib/sort";
import { useInitialDocument } from "@/lib/use-initial-document";
import type { RomDetail } from "@/lib/types";
import type { Route } from "./+types/roms";

const STATUS_LABELS: Record<RomDetail["status"], string> = {
  active: "Active",
  discontinued: "Discontinued",
  unknown: "Unknown",
};

function romHaystack(rom: RomDetail): string {
  return [
    rom.name,
    ...rom.devices.flatMap((device) => [device.name ?? "", device.codename]),
  ]
    .join(" ")
    .toLowerCase();
}

function RomRow({ rom, count }: { rom: RomDetail; count?: boolean }) {
  return (
    <Link to={`/roms/${rom.id}`} prefetch="intent" className="directory-row">
      <span className="truncate font-medium">{rom.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        <span
          className={
            rom.status === "active" ? undefined : "text-muted-foreground"
          }
        >
          {STATUS_LABELS[rom.status]}
        </span>
        {count && (
          <>
            {" · "}
            {rom.deviceCount} {rom.deviceCount === 1 ? "device" : "devices"}
          </>
        )}
      </span>
    </Link>
  );
}

function firstLetter(name: string): string {
  const key = name.replace(/^[^\p{L}\p{N}]+/u, "");
  const first = key.charAt(0);
  return /^\p{L}/u.test(first) ? first.toUpperCase() : "#";
}

export const meta: Route.MetaFunction = ({ loaderData, matches, error }) => {
  if (error) return errorMeta();
  const roms = loaderData?.roms ?? [];
  const covered = roms.filter((rom) => rom.deviceCount > 0);
  const updatedAt = updatedAtFromMatches(matches);
  const deviceCount = new Set(
    roms.flatMap((rom) =>
      rom.devices.map((device) => `${device.vendor}/${device.codename}`),
    ),
  ).size;

  return [
    ...pageMeta({
      title: "Custom Android ROMs and supported devices | unrom",
      description: `${roms.length} custom ROMs; ${covered.length} currently have device data, covering ${deviceCount} devices. Browse every Android ROM with API access.`,
      path: "/roms",
    }),
    ...modifiedMeta(updatedAt),
    {
      "script:ld+json": itemListLd(
        "Custom ROMs",
        covered.map((rom) => ({ name: rom.name, path: `/roms/${rom.id}` })),
      ),
    },
  ];
};

export async function loader() {
  return { roms: await fetchRoms() };
}

export async function clientLoader() {
  return { roms: await fetchRoms() };
}

export default function RomsRoute() {
  const { roms } = useLoaderData<typeof loader>();
  const [query, setQuery] = useState("");
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const initialDocument = useInitialDocument();

  useEffect(() => {
    seedRoms(roms);
  }, [roms]);

  const covered = useMemo(
    () =>
      roms
        .filter((rom) => rom.deviceCount > 0)
        .sort(
          (a, b) => b.deviceCount - a.deviceCount || bySortKey(a.name, b.name),
        ),
    [roms],
  );
  const catalogue = useMemo(
    () =>
      roms
        .filter((rom) => rom.deviceCount === 0)
        .sort((a, b) => bySortKey(a.name, b.name)),
    [roms],
  );

  const terms = useMemo(() => tokenize(query), [query]);
  const matches = useMemo(
    () => (rom: RomDetail) =>
      terms.length === 0 || matchesAll(romHaystack(rom), terms),
    [terms],
  );

  const filteredCovered = useMemo(
    () => covered.filter(matches),
    [covered, matches],
  );
  const filteredCatalogue = useMemo(
    () => catalogue.filter(matches),
    [catalogue, matches],
  );

  const catalogueGroups = useMemo(() => {
    const groups: Array<{ letter: string; roms: RomDetail[] }> = [];
    const index = new Map<string, { letter: string; roms: RomDetail[] }>();
    for (const rom of filteredCatalogue) {
      const letter = firstLetter(rom.name);
      let group = index.get(letter);
      if (!group) {
        group = { letter, roms: [] };
        index.set(letter, group);
        groups.push(group);
      }
      group.roms.push(rom);
    }
    return groups;
  }, [filteredCatalogue]);

  const catalogueIsOpen = catalogueOpen || query.trim().length > 0;
  const total = filteredCovered.length + filteredCatalogue.length;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "ROMs" }]} />

      <PageHeader
        title="ROMs"
        description={`${roms.length} ROMs in the catalogue, ${covered.length} with device data.`}
        endpoint="/api/roms"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          id="roms-search"
          value={query}
          onValueChange={setQuery}
          placeholder="Filter ROMs or devices…"
          ariaLabel="Filter ROMs"
          className="max-w-md"
        />
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums"
        >
          {total} of {roms.length} ROMs
        </p>
      </div>

      {total === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No ROMs match “{query.trim()}”.
        </p>
      ) : (
        <>
          {filteredCovered.length > 0 && (
            <section
              aria-labelledby="roms-covered"
              className="flex flex-col gap-3"
            >
              <h2
                id="roms-covered"
                className="font-heading text-lg font-semibold tracking-tight"
              >
                With device data
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {filteredCovered.map((rom) => (
                  <li key={rom.id}>
                    <RomRow rom={rom} count />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {filteredCatalogue.length > 0 && (
            <details
              open={catalogueIsOpen}
              onToggle={(event) => setCatalogueOpen(event.currentTarget.open)}
              className="rounded-xl border border-border/60"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                Catalogue only — {filteredCatalogue.length}{" "}
                {filteredCatalogue.length === 1 ? "ROM" : "ROMs"} with no device
                data yet
              </summary>
              <div className="flex flex-col gap-5 px-4 pb-4">
                {(initialDocument || catalogueIsOpen) &&
                  catalogueGroups.map((group) => (
                    <section
                      key={group.letter}
                      aria-labelledby={`catalogue-${group.letter}`}
                      className="flex flex-col gap-2"
                    >
                      <h3
                        id={`catalogue-${group.letter}`}
                        className="font-heading text-xs font-semibold text-muted-foreground"
                      >
                        {group.letter}
                      </h3>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {group.roms.map((rom) => (
                          <li key={rom.id}>
                            <RomRow rom={rom} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
