import { useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
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
import { referenceLabel } from "@/lib/sort";
import type { Mapping } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["vendor", "referenceUrl"]);
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

export default function MappingsTable({ mappings }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const vendorNameBySlug = useMemo(
    () => new Map(mappings.map((row) => [row.vendor, row.vendorName])),
    [mappings],
  );
  const slugByVendorName = useMemo(
    () => new Map(mappings.map((row) => [row.vendorName, row.vendor])),
    [mappings],
  );
  const romNameById = useMemo(
    () => new Map(mappings.map((row) => [row.romId, row.romName])),
    [mappings],
  );
  const idByRomName = useMemo(
    () => new Map(mappings.map((row) => [row.romName, row.romId])),
    [mappings],
  );

  const [search, setSearch] = useState("");
  const [userVisibility, setUserVisibility] = useState<VisibilityState>({});

  // Facet filters live in state (for synchronous multi-select) and follow the
  // URL for Back/Forward and deep links. Each param may hold a comma-separated
  // list for multi-select.
  const deriveFacets = useMemo(
    () =>
      (params: URLSearchParams): ColumnFiltersState => {
        const next: ColumnFiltersState = [];
        const split = (key: string) =>
          (params.get(key) ?? "").split(",").filter(Boolean);

        const vendors = split("vendor")
          .map((slug) => vendorNameBySlug.get(slug))
          .filter((name): name is string => name !== undefined);
        const roms = split("rom")
          .map((id) => romNameById.get(id))
          .filter((name): name is string => name !== undefined);
        const devices = split("device");

        if (vendors.length) next.push({ id: "vendorName", value: vendors });
        if (roms.length) next.push({ id: "romName", value: roms });
        if (devices.length) next.push({ id: "codename", value: devices });
        return next;
      },
    [vendorNameBySlug, romNameById],
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
  }

  const filters = useMemo<ColumnFiltersState>(
    () =>
      search ? [...facetState, { id: "search", value: search }] : facetState,
    [facetState, search],
  );

  const facetValues = (id: string) =>
    (facetState.find((f) => f.id === id)?.value as string[] | undefined) ?? [];
  const activeVendors = facetValues("vendorName");
  const activeCodenames = facetValues("codename");
  const activeRoms = facetValues("romName");

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
    setSearch((next.find((f) => f.id === "search")?.value as string) ?? "");

    const value = (id: string) =>
      next.find((f) => f.id === id)?.value as string[] | undefined;
    const vendors = value("vendorName");
    const roms = value("romName");
    const devices = value("codename");

    setFacetState(next.filter((f) => f.id !== "search"));

    const facetsChanged =
      JSON.stringify([vendors, roms, devices]) !==
      JSON.stringify([
        facetState.find((f) => f.id === "vendorName")?.value,
        facetState.find((f) => f.id === "romName")?.value,
        facetState.find((f) => f.id === "codename")?.value,
      ]);

    const params = new URLSearchParams(searchParams);
    const setParam = (key: string, value2: string | undefined) => {
      if (value2) params.set(key, value2);
      else params.delete(key);
    };
    setParam(
      "vendor",
      vendors?.length
        ? vendors.map((name) => slugByVendorName.get(name) ?? name).join(",")
        : undefined,
    );
    setParam(
      "rom",
      roms?.length
        ? roms.map((name) => idByRomName.get(name) ?? name).join(",")
        : undefined,
    );
    setParam("device", devices?.length ? devices.join(",") : undefined);
    setSearchParams(params, { replace: !facetsChanged });
  };

  const vendorOptions = useMemo<FacetOption[]>(() => {
    const set = new Set(mappings.map((row) => row.vendorName));
    return [...set].sort().map((value) => ({ label: value, value }));
  }, [mappings]);

  const romOptions = useMemo<FacetOption[]>(() => {
    const map = new Map<string, string>();
    for (const row of mappings) map.set(row.romId, row.romName);
    return [...map.entries()]
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vendor" />
        ),
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() =>
              toggleFilter(table, "vendorName", row.original.vendorName)
            }
            className="w-fit max-w-full truncate text-left text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendorName}
          </button>
        ),
      },
      {
        accessorKey: "vendor",
        meta: { title: "Vendor ID" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vendor ID" />
        ),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() =>
              toggleFilter(table, "vendorName", row.original.vendorName)
            }
            className="w-fit max-w-full truncate text-left font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendor}
          </button>
        ),
      },
      {
        accessorKey: "deviceName",
        meta: { title: "Device" },
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM" />
        ),
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() => toggleFilter(table, "romName", row.original.romName)}
            className="w-fit max-w-full truncate text-left font-medium hover:underline"
          >
            {row.original.romName}
          </button>
        ),
      },
      {
        accessorKey: "romId",
        meta: { title: "ROM ID" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM ID" />
        ),
        cell: ({ row, table }) => (
          <button
            type="button"
            onClick={() => toggleFilter(table, "romName", row.original.romName)}
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
      initialState={{
        sorting: [
          { id: "vendorName", desc: false },
          { id: "deviceName", desc: false },
        ],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="mappings-search"
            value={search}
            onValueChange={setSearch}
            placeholder="Filter mappings…"
            ariaLabel="Filter mappings"
          />
          {table.getColumn("vendorName") && (
            <DataTableFacetedFilter
              column={table.getColumn("vendorName")!}
              title="Vendor"
              options={vendorOptions}
            />
          )}
          {table.getColumn("romName") && (
            <DataTableFacetedFilter
              column={table.getColumn("romName")!}
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
                onRemove={(value) => toggleFilter(table, "vendorName", value)}
              />
              <FilterChip
                items={activeCodenames}
                prefix="Device"
                onRemove={(value) => toggleFilter(table, "codename", value)}
              />
              <FilterChip
                items={activeRoms}
                prefix="ROM"
                onRemove={(value) => toggleFilter(table, "romName", value)}
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
  items: string[];
  prefix: string;
  onRemove: (value: string) => void;
}) {
  return items.map((value) => (
    <Badge key={value} variant="secondary" className="gap-1 pr-1">
      {prefix}: {value}
      <button
        type="button"
        onClick={() => onRemove(value)}
        aria-label={`Remove ${prefix} filter ${value}`}
        className="rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </Badge>
  ));
}
