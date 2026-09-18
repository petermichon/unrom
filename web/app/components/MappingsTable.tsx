import { useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
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

// Filter to a single device. Codenames are only unique per vendor, so the
// vendor filter is set too.
function selectDevice<T>(
  table: Table<T>,
  vendorName: string,
  codename: string,
): void {
  const current = table.getState().columnFilters;
  const already =
    (current.find((f) => f.id === "vendorName")?.value as string[] | undefined)
      ?.length === 1 &&
    (current.find((f) => f.id === "codename")?.value as string[] | undefined)
      ?.length === 1;

  const rest = current.filter(
    (f) => f.id !== "vendorName" && f.id !== "codename",
  );
  table.setColumnFilters(
    already
      ? rest
      : [
          ...rest,
          { id: "vendorName", value: [vendorName] },
          { id: "codename", value: [codename] },
        ],
  );
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

  // The URL is the source of truth for the facet filters, so the table stays in
  // sync with Back/Forward and deep links.
  const facetFilters = useMemo<ColumnFiltersState>(() => {
    const next: ColumnFiltersState = [];
    const vendor = searchParams.get("vendor");
    const rom = searchParams.get("rom");
    const device = searchParams.get("device");
    const vendorName = vendor ? vendorNameBySlug.get(vendor) : undefined;
    const romName = rom ? romNameById.get(rom) : undefined;
    if (vendorName) next.push({ id: "vendorName", value: [vendorName] });
    if (romName) next.push({ id: "romName", value: [romName] });
    if (device) next.push({ id: "codename", value: [device] });
    return next;
  }, [searchParams, vendorNameBySlug, romNameById]);

  const filters = useMemo<ColumnFiltersState>(
    () =>
      search
        ? [...facetFilters, { id: "search", value: search }]
        : facetFilters,
    [facetFilters, search],
  );

  const count = (id: string) =>
    (facetFilters.find((f) => f.id === id)?.value as string[] | undefined)
      ?.length ?? 0;

  // The id columns are hidden by default; a single-value facet filter also hides
  // its now-redundant name column. User toggles from View are layered on top.
  const visibility: VisibilityState = {
    search: false,
    referenceUrl: userVisibility.referenceUrl ?? false,
    vendor: userVisibility.vendor ?? false,
    codename: userVisibility.codename ?? false,
    romId: userVisibility.romId ?? false,
    vendorName:
      count("vendorName") === 1 ? false : (userVisibility.vendorName ?? true),
    deviceName:
      count("codename") === 1 ? false : (userVisibility.deviceName ?? true),
    romName: count("romName") === 1 ? false : (userVisibility.romName ?? true),
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

    const facetsChanged =
      JSON.stringify([vendors, roms, devices]) !==
      JSON.stringify([
        facetFilters.find((f) => f.id === "vendorName")?.value,
        facetFilters.find((f) => f.id === "romName")?.value,
        facetFilters.find((f) => f.id === "codename")?.value,
      ]);

    const params = new URLSearchParams(searchParams);
    const setParam = (key: string, value2: string | undefined) => {
      if (value2) params.set(key, value2);
      else params.delete(key);
    };
    setParam(
      "vendor",
      vendors?.length === 1
        ? (slugByVendorName.get(vendors[0]) ?? vendors[0])
        : undefined,
    );
    setParam(
      "rom",
      roms?.length === 1 ? (idByRomName.get(roms[0]) ?? roms[0]) : undefined,
    );
    setParam("device", devices?.length === 1 ? devices[0] : undefined);
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
                  selectDevice(
                    table,
                    row.original.vendorName,
                    row.original.codename,
                  )
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
          {(facetFilters.length > 0 || search !== "") && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setUserVisibility({});
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
            >
              Reset
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      )}
    />
  );
}
