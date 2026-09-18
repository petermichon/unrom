import { useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { Link, useSearchParams } from "react-router";
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

  // Read the initial filters from the URL once; afterwards the URL follows the
  // table state.
  const initialFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    const vendor = searchParams.get("vendor");
    const rom = searchParams.get("rom");
    const vendorName = vendor ? vendorNameBySlug.get(vendor) : undefined;
    const romName = rom ? romNameById.get(rom) : undefined;
    if (vendorName) filters.push({ id: "vendorName", value: [vendorName] });
    if (romName) filters.push({ id: "romName", value: [romName] });
    return filters;
    // Intentionally read the URL only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [filters, setFilters] = useState<ColumnFiltersState>(initialFilters);
  const [visibility, setVisibility] = useState<VisibilityState>(() => ({
    search: false,
    referenceUrl: false,
    vendorName: !initialFilters.some((f) => f.id === "vendorName"),
    romName: !initialFilters.some((f) => f.id === "romName"),
  }));

  const handleFilters = (next: ColumnFiltersState) => {
    setFilters(next);
    const vendors = next.find((f) => f.id === "vendorName")?.value as
      string[] | undefined;
    const roms = next.find((f) => f.id === "romName")?.value as
      string[] | undefined;

    // A single-value filter narrows to one context, so hide that column.
    setVisibility((prev) => ({
      ...prev,
      vendorName: vendors?.length === 1 ? false : true,
      romName: roms?.length === 1 ? false : true,
    }));

    const params = new URLSearchParams(searchParams);
    const setParam = (key: string, value: string | undefined) => {
      if (value) params.set(key, value);
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
    setSearchParams(params, { replace: true });
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
        cell: ({ row }) => {
          const name = row.original.deviceName ?? row.original.codename;
          return (
            <div className="flex min-w-0 flex-col">
              <Link
                to={`/devices/${row.original.vendor}/${row.original.codename}`}
                prefetch="intent"
                title={name}
                className="w-fit max-w-full truncate font-medium hover:underline"
              >
                {name}
              </Link>
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
        meta: { title: "Source" },
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
      onColumnVisibilityChange={setVisibility}
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
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
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
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters();
                setVisibility({
                  search: false,
                  referenceUrl: false,
                  vendorName: true,
                  romName: true,
                });
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
