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
import type { BrowseDevice } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["vendor", "codename"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  devices: BrowseDevice[];
}

export default function DevicesTable({ devices }: Props) {
  const romOptions = useMemo<FacetOption[]>(() => {
    const counts = new Set(devices.map((device) => device.roms.length));
    return [...counts]
      .sort((a, b) => a - b)
      .map((count) => ({
        label: `${count} ${count === 1 ? "ROM" : "ROMs"}`,
        value: String(count),
      }));
  }, [devices]);

  const columns = useMemo<ColumnDef<BrowseDevice>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [row.name, row.codename, row.vendor].filter(Boolean).join(" "),
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
        cell: ({ row }) => (
          <Link
            to={`/devices/${row.original.vendor}`}
            prefetch="intent"
            title={row.original.vendorName}
            className="w-fit max-w-full truncate text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendorName}
          </Link>
        ),
      },
      {
        accessorKey: "name",
        meta: { title: "Device" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device" />
        ),
        cell: ({ row }) => {
          const name = row.original.name ?? row.original.codename;
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
                {row.original.codename}
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
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.codename}
          </span>
        ),
      },
      {
        id: "roms",
        accessorFn: (row) => row.roms.length,
        meta: { title: "ROMs" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROMs" />
        ),
        cell: ({ row }) => {
          // The ROM list lives on the device page; the table shows the count.
          const count = row.original.roms.length;
          return (
            <Link
              to={`/devices/${row.original.vendor}/${row.original.codename}`}
              prefetch="intent"
              className="w-fit max-w-full text-muted-foreground hover:text-foreground hover:underline"
            >
              {count} {count === 1 ? "ROM" : "ROMs"}
            </Link>
          );
        },
        filterFn: (row, id, value: string[]) =>
          value.includes(String(row.getValue(id))),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={devices}
      columnClassName={columnClassName}
      tableClassName="min-w-[40rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "roms", desc: true }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="devices-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter devices…"
            ariaLabel="Filter devices"
          />
          {table.getColumn("roms") && (
            <DataTableFacetedFilter
              column={table.getColumn("roms")!}
              title="ROMs"
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
