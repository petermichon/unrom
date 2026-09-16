import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
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
import type { DeviceSummary } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["codename"]);
const COLUMN_WIDTHS: Record<string, string> = {
  search: "w-0",
  name: "w-[36%] whitespace-normal",
  codename: "w-[24%]",
  brand: "w-[40%]",
};
const columnClassName = (id: string) =>
  [MOBILE_HIDDEN.has(id) && "hidden md:table-cell", COLUMN_WIDTHS[id]]
    .filter(Boolean)
    .join(" ") || undefined;

interface Props {
  devices: DeviceSummary[];
}

export default function RomDevicesTable({ devices }: Props) {
  const brandOptions = useMemo<FacetOption[]>(() => {
    const set = new Set(
      devices
        .map((device) => device.brand)
        .filter((value): value is string => Boolean(value)),
    );
    return [...set].sort().map((value) => ({ label: value, value }));
  }, [devices]);

  const columns = useMemo<ColumnDef<DeviceSummary>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [row.name, row.codename, row.brand].filter(Boolean).join(" "),
        filterFn: "includesString",
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col items-start">
            <Link
              to={`/devices/${row.original.codename}`}
              prefetch="intent"
              className="font-medium hover:underline"
            >
              {row.original.name ?? row.original.codename}
            </Link>
            <span className="font-mono text-xs text-muted-foreground md:hidden">
              {[row.original.codename, row.original.brand]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "codename",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Codename" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.codename}
          </span>
        ),
      },
      {
        accessorKey: "brand",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Brand" />
        ),
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.brand}</span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={devices}
      columnClassName={columnClassName}
      tableClassName="table-fixed min-w-[40rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "name", desc: false }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="rom-devices-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter devices…"
            ariaLabel="Filter devices"
          />
          {table.getColumn("brand") && (
            <DataTableFacetedFilter
              column={table.getColumn("brand")!}
              title="Brand"
              options={brandOptions}
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
