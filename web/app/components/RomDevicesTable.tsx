import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import type { DeviceSummary } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["codename"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  devices: DeviceSummary[];
}

export default function RomDevicesTable({ devices }: Props) {
  const columns = useMemo<ColumnDef<DeviceSummary>[]>(
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
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={devices}
      columnClassName={columnClassName}
      tableClassName="min-w-[36rem]"
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
