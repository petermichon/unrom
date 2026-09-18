import { useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import { ExternalLink, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  DataTableFacetedFilter,
  type FacetOption,
} from "@/components/data-table/data-table-faceted-filter";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bySortKey, referenceLabel } from "@/lib/sort";
import type { Mapping } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["vendor", "referenceUrl"]);
const PAGE_SIZE = 10;
const DEFAULT_SORTING: SortingState = [
  { id: "vendorName", desc: false },
  { id: "deviceName", desc: false },
];
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  mappings: Mapping[];
}

// Toggle a value in a column's facet filter.
function toggleFilter<T>(
  table: Table<T>,
  columnId: string,
  value: string,
): void {
  const column = table.getColumn(columnId);
  if (!column) return;
  const current = (column.getFilterValue() as string[] | undefined) ?? [];
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
  column.setFilterValue(next.length ? next : undefined);
}

// Read facet filters from the URL. Values are stable ids: vendor slug,
// codename, and rom id, each as a repeated param.
function deriveFacets(params: URLSearchParams): ColumnFiltersState {
  const next: ColumnFiltersState = [];
  const values = (key: string) => params.getAll(key).filter(Boolean);
  const vendors = values("vendor");
  const devices = values("device");
  const roms = values("rom");
  if (vendors.length) next.push({ id: "vendor", value: vendors });
  if (devices.length) next.push({ id: "codename", value: devices });
  if (roms.length) next.push({ id: "romId", value: roms });
  return next;
}

function deriveSorting(params: URLSearchParams): SortingState {
  const id = params.get("sort");
  if (!id) return DEFAULT_SORTING;
  return [{ id, desc: params.get("order") === "desc" }];
}

function derivePagination(params: URLSearchParams): PaginationState {
  const page = Number(params.get("page") ?? "1");
  return {
    pageIndex: Number.isFinite(page) && page > 1 ? page - 1 : 0,
    pageSize: PAGE_SIZE,
  };
}

export default function MappingsTable({ mappings }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Facet filters use stable ids (vendor slug, codename, rom id); these maps
  // render the human labels.
  const vendorNameBySlug = useMemo(
    () => new Map(mappings.map((row) => [row.vendor, row.vendorName])),
    [mappings],
  );
  const romNameById = useMemo(
    () => new Map(mappings.map((row) => [row.romId, row.romName])),
    [mappings],
  );

  const [search, setSearch] = useState("");
  const [userVisibility, setUserVisibility] = useState<VisibilityState>({});
  const [sortingState, setSortingState] = useState<SortingState>(() =>
    deriveSorting(searchParams),
  );
  const [paginationState, setPaginationState] = useState<PaginationState>(() =>
    derivePagination(searchParams),
  );
  const [facetState, setFacetState] = useState<ColumnFiltersState>(() =>
    deriveFacets(searchParams),
  );

  // Sync from the URL when it changes externally (Back/Forward, deep link).
  // Adjusting state during render is the supported alternative to an effect.
  const [syncedParams, setSyncedParams] = useState(searchParams);
  if (searchParams !== syncedParams) {
    setSyncedParams(searchParams);
    setFacetState(deriveFacets(searchParams));
    setSortingState(deriveSorting(searchParams));
    setPaginationState(derivePagination(searchParams));
  }

  const filters = useMemo<ColumnFiltersState>(
    () =>
      search ? [...facetState, { id: "search", value: search }] : facetState,
    [facetState, search],
  );

  const facetValues = (id: string) =>
    (facetState.find((f) => f.id === id)?.value as string[] | undefined) ?? [];
  const activeVendors = facetValues("vendor").map((value) => ({
    value,
    label: vendorNameBySlug.get(value) ?? value,
  }));
  const activeCodenames = facetValues("codename").map((value) => ({
    value,
    label: value,
  }));
  const activeRoms = facetValues("romId").map((value) => ({
    value,
    label: romNameById.get(value) ?? value,
  }));

  // Columns never change visibility because of filters; only explicit View
  // toggles (userVisibility) apply. The id columns are hidden by default.
  const visibility: VisibilityState = {
    search: false,
    referenceUrl: userVisibility.referenceUrl ?? false,
    vendor: userVisibility.vendor ?? false,
    codename: userVisibility.codename ?? false,
    romId: userVisibility.romId ?? false,
    vendorName: userVisibility.vendorName ?? true,
    deviceName: userVisibility.deviceName ?? true,
    romName: userVisibility.romName ?? true,
  };

  const handleVisibility = (next: VisibilityState) => {
    setUserVisibility((prev) => {
      const merged = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] !== visibility[key]) merged[key] = next[key];
      }
      return merged;
    });
  };

  const handleFilters = (next: ColumnFiltersState) => {
    const nextSearch =
      (next.find((f) => f.id === "search")?.value as string) ?? "";
    setSearch(nextSearch);

    const value = (id: string) =>
      next.find((f) => f.id === id)?.value as string[] | undefined;
    const vendors = value("vendor");
    const roms = value("romId");
    const devices = value("codename");

    setFacetState(next.filter((f) => f.id !== "search"));

    const facetsChanged =
      JSON.stringify([vendors, roms, devices]) !==
      JSON.stringify([
        facetState.find((f) => f.id === "vendor")?.value,
        facetState.find((f) => f.id === "romId")?.value,
        facetState.find((f) => f.id === "codename")?.value,
      ]);
    // A changed filter invalidates the current page.
    const changed = facetsChanged || nextSearch !== search;
    if (changed) setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));

    const setParam = (
      params: URLSearchParams,
      key: string,
      values: string[] | undefined,
    ) => {
      params.delete(key);
      for (const item of values ?? []) params.append(key, item);
    };
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        setParam(params, "vendor", vendors);
        setParam(params, "device", devices);
        setParam(params, "rom", roms);
        if (changed) params.delete("page");
        return params;
      },
      { replace: !facetsChanged },
    );
  };

  // Sorting is discrete: push history so Back undoes it. Page changes replace.
  const handleSorting = (next: SortingState) => {
    setSortingState(next);
    setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));

    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      const first = next[0];
      if (first) {
        params.set("sort", first.id);
        params.set("order", first.desc ? "desc" : "asc");
      } else {
        params.delete("sort");
        params.delete("order");
      }
      params.delete("page");
      return params;
    });
  };

  const handlePagination = (next: PaginationState) => {
    setPaginationState(next);
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next.pageIndex > 0) params.set("page", String(next.pageIndex + 1));
        else params.delete("page");
        return params;
      },
      { replace: true },
    );
  };

  const vendorOptions = useMemo<FacetOption[]>(() => {
    const map = new Map<string, string>();
    for (const row of mappings) map.set(row.vendor, row.vendorName);
    return [...map.entries()]
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => bySortKey(a.label, b.label));
  }, [mappings]);

  const romOptions = useMemo<FacetOption[]>(() => {
    const map = new Map<string, string>();
    for (const row of mappings) map.set(row.romId, row.romName);
    return [...map.entries()]
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => bySortKey(a.label, b.label));
  }, [mappings]);

  const columns = useMemo<ColumnDef<Mapping>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [
            row.deviceName,
            row.codename,
            row.vendor,
            row.vendorName,
            row.romName,
          ]
            .filter(Boolean)
            .join(" "),
        filterFn: "includesString",
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
      {
        accessorKey: "vendorName",
        meta: { title: "Vendor" },
        sortingFn: (a, b) =>
          bySortKey(a.original.vendorName, b.original.vendorName),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vendor" />
        ),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() => toggleFilter(table, "vendor", row.original.vendor)}
            className="w-fit max-w-full truncate text-left text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendorName}
          </button>
        ),
      },
      {
        accessorKey: "vendor",
        meta: { title: "Vendor ID" },
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vendor ID" />
        ),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() => toggleFilter(table, "vendor", row.original.vendor)}
            className="w-fit max-w-full truncate text-left font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendor}
          </button>
        ),
      },
      {
        accessorKey: "deviceName",
        meta: { title: "Device" },
        sortingFn: (a, b) =>
          bySortKey(
            a.original.deviceName ?? a.original.codename,
            b.original.deviceName ?? b.original.codename,
          ),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device" />
        ),
        cell: ({ row, table }) => {
          const name = row.original.deviceName ?? row.original.codename;
          return (
            <div className="flex min-w-0 flex-col">
              <button
                type="button"
                onClick={() =>
                  toggleFilter(table, "codename", row.original.codename)
                }
                className="w-fit max-w-full truncate text-left font-medium hover:underline"
              >
                {name}
              </button>
              <span className="truncate font-mono text-xs text-muted-foreground md:hidden">
                {[row.original.vendorName, row.original.codename].join(" · ")}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "codename",
        meta: { title: "Codename" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Codename" />
        ),
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() =>
              toggleFilter(table, "codename", row.original.codename)
            }
            className="w-fit max-w-full truncate text-left font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.codename}
          </button>
        ),
      },
      {
        accessorKey: "romName",
        meta: { title: "ROM" },
        sortingFn: (a, b) => bySortKey(a.original.romName, b.original.romName),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM" />
        ),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() => toggleFilter(table, "romId", row.original.romId)}
            className="w-fit max-w-full truncate text-left font-medium hover:underline"
          >
            {row.original.romName}
          </button>
        ),
      },
      {
        accessorKey: "romId",
        meta: { title: "ROM ID" },
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM ID" />
        ),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() => toggleFilter(table, "romId", row.original.romId)}
            className="w-fit max-w-full truncate text-left font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.romId}
          </button>
        ),
      },
      {
        accessorKey: "referenceUrl",
        meta: { title: "Reference" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Reference" />
        ),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.referenceUrl ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={row.original.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open reference: ${row.original.referenceUrl}`}
                    className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  />
                }
              >
                <span className="truncate">
                  {referenceLabel(row.original.referenceUrl)}
                </span>
                <ExternalLink className="size-3 shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md break-all">
                {row.original.referenceUrl}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={mappings}
      columnClassName={columnClassName}
      tableClassName="min-w-[52rem]"
      columnFilters={filters}
      onColumnFiltersChange={handleFilters}
      columnVisibility={visibility}
      onColumnVisibilityChange={handleVisibility}
      sorting={sortingState}
      onSortingChange={handleSorting}
      pagination={paginationState}
      onPaginationChange={handlePagination}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="mappings-search"
            value={search}
            onValueChange={setSearch}
            placeholder="Filter mappings…"
            ariaLabel="Filter mappings"
          />
          {table.getColumn("vendor") && (
            <DataTableFacetedFilter
              column={table.getColumn("vendor")!}
              title="Vendor"
              options={vendorOptions}
            />
          )}
          {table.getColumn("romId") && (
            <DataTableFacetedFilter
              column={table.getColumn("romId")!}
              title="ROM"
              options={romOptions}
            />
          )}
          <DataTableViewOptions table={table} />
          {(activeVendors.length > 0 ||
            activeCodenames.length > 0 ||
            activeRoms.length > 0) && (
            <div className="flex basis-full flex-wrap items-center gap-1.5">
              <FilterChip
                items={activeVendors}
                prefix="Vendor"
                onRemove={(value) => toggleFilter(table, "vendor", value)}
              />
              <FilterChip
                items={activeCodenames}
                prefix="Device"
                onRemove={(value) => toggleFilter(table, "codename", value)}
              />
              <FilterChip
                items={activeRoms}
                prefix="ROM"
                onRemove={(value) => toggleFilter(table, "romId", value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-xs text-muted-foreground"
                onClick={() => {
                  setSearch("");
                  setSearchParams(new URLSearchParams(), { replace: true });
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </DataTableToolbar>
      )}
    />
  );
}

function FilterChip({
  items,
  prefix,
  onRemove,
}: {
  items: { value: string; label: string }[];
  prefix: string;
  onRemove: (value: string) => void;
}) {
  return items.map(({ value, label }) => (
    <Badge key={value} variant="secondary" className="gap-1 pr-1">
      {prefix}: {label}
      <button
        type="button"
        onClick={() => onRemove(value)}
        aria-label={`Remove ${prefix} filter ${label}`}
        className="rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </Badge>
  ));
}
