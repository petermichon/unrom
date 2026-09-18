import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router";
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
import { referenceLabel } from "@/lib/sort";
import type { Mapping } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["vendor", "sourceUrl"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  mappings: Mapping[];
}

export default function MappingsTable({ mappings }: Props) {
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
        cell: ({ row }) => (
          <Link
            to={`/devices/${row.original.vendor}`}
            prefetch="intent"
            className="w-fit max-w-full text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendorName}
          </Link>
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
        cell: ({ row }) => (
          <Link
            to={`/roms/${row.original.romId}`}
            prefetch="intent"
            title={row.original.romName}
            className="w-fit max-w-full truncate font-medium hover:underline"
          >
            {row.original.romName}
          </Link>
        ),
      },
      {
        accessorKey: "sourceUrl",
        meta: { title: "Source" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Source" />
        ),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.sourceUrl ? (
            <a
              href={row.original.sourceUrl}
              target="_blank"
              rel="noreferrer"
              title={row.original.sourceUrl}
              className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <span className="truncate">
                {referenceLabel(row.original.sourceUrl)}
              </span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
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
      initialState={{
        columnVisibility: { search: false, sourceUrl: false },
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
            <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
              Reset
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      )}
    />
  );
}
