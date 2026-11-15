import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ROM_BOLD_MARKS, ROM_LOGOS } from "@/components/RomPhone";
import { RomMark } from "@/components/RomMark";
import { MENU_ROMS } from "@/lib/nav";
import { SearchInput } from "@/components/SearchInput";
import { fetchRoms } from "@/lib/data";
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
import { formatNumber } from "@/lib/utils";
import { StatusPill } from "@/components/StatusPill";
import type { RomDetail } from "@/lib/types";
import type { Route } from "./+types/roms";

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
    <Link to={`/roms/${rom.id}`} prefetch="intent" className="index-row">
      <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="min-w-0 flex-1 truncate font-semibold">
          {rom.name}
        </span>
        <span className="sm:hidden">
          <StatusPill status={rom.status} />
        </span>
      </span>
      <span className="hidden w-20 shrink-0 justify-end sm:flex">
        <StatusPill status={rom.status} />
      </span>
      {count && (
        <span className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
          {formatNumber(rom.deviceCount)}{" "}
          {rom.deviceCount === 1 ? "device" : "devices"}
        </span>
      )}
    </Link>
  );
}

/**
 * Optical sizing for the all-ROMs banner: a square box with `contain` makes a
 * wide mark short and a full-bleed square look heavy. Give each mark a box that
 * matches its artwork, so they share a height instead of a bounding square.
 */
const MARK_BOXES: Record<string, string> = {
  grapheneos: "h-11 w-11 sm:h-14 sm:w-14",
  calyxos: "h-9 w-9 sm:h-11 sm:w-11",
  iode: "h-10 w-10 sm:h-12 sm:w-12",
  eos: "h-9 w-9 sm:h-11 sm:w-11",
  lineageos: "h-8 w-24 sm:h-10 sm:w-24",
};

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
      description: `${formatNumber(roms.length)} custom ROMs; ${formatNumber(covered.length)} currently have device data, covering ${formatNumber(deviceCount)} devices. Browse every Android ROM with API access.`,
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
    <div className="flex flex-col gap-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "ROMs" }]} />

      <div className="hero-panel relative flex flex-col gap-6 overflow-hidden rounded-4xl bg-panel px-6 py-8 text-panel-foreground ring-1 ring-black/[0.03] sm:px-8 sm:py-10 dark:ring-white/[0.08]">
        <div className="relative z-10 flex min-w-0 flex-col gap-6">
          <div className="flex min-w-0 flex-col gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              ROMs
            </h1>
            <p className="max-w-[62ch] text-sm leading-relaxed text-panel-foreground/75">
              Every Android project unrom tracks, and the devices each one
              supports.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <a
                href="/api/roms"
                title="API response: /api/roms"
                className="font-semibold text-panel-foreground/70 underline underline-offset-4 outline-none hover:text-panel-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                API
              </a>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="order-last flex items-center gap-3 self-end sm:absolute sm:top-1/2 sm:right-8 sm:order-none sm:gap-5 sm:-translate-y-1/2"
        >
          {MENU_ROMS.map((rom) => {
            const src = ROM_BOLD_MARKS[rom.id] ?? ROM_LOGOS[rom.id];
            return src ? (
              <RomMark
                key={rom.id}
                id={rom.id}
                src={src}
                className={MARK_BOXES[rom.id] ?? "size-10 sm:size-12"}
              />
            ) : null;
          })}
        </div>
      </div>

      <p className="-mt-4 text-sm text-muted-foreground">
        {formatNumber(roms.length)} ROMs in the catalogue,{" "}
        {formatNumber(covered.length)} with device data.
      </p>

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
          {total} of {formatNumber(roms.length)} ROMs
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
              className="flex flex-col gap-2"
            >
              <h2
                id="roms-covered"
                className="font-heading text-xl font-bold tracking-tight"
              >
                With device data
              </h2>
              <div
                aria-hidden="true"
                className="flex items-center gap-3 px-4 text-xs font-medium text-muted-foreground"
              >
                <span className="flex-1">ROM</span>
                <span className="hidden w-20 text-right sm:block">Status</span>
                <span className="w-24 text-right">Devices</span>
              </div>
              <ul className="index-frame">
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
              className="index-frame"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                Catalogue only: {formatNumber(filteredCatalogue.length)}{" "}
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
                      <ul className="grid gap-x-6 sm:grid-cols-2">
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
