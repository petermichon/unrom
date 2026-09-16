import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { ChipLink } from "@/components/ChipLink";
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

const MOBILE_HIDDEN = new Set(["codename", "brand"]);
const COLUMN_WIDTHS: Record<string, string> = {
  search: "w-0",
  brand: "w-[12%]",
  name: "w-[24%] whitespace-normal",
  codename: "w-[14%]",
  roms: "w-[50%]",
};
const columnClassName = (id: string) =>
  [MOBILE_HIDDEN.has(id) && "hidden md:table-cell", COLUMN_WIDTHS[id]]
    .filter(Boolean)
    .join(" ") || undefined;

interface Props {
  devices: BrowseDevice[];
}

export default function DevicesTable({ devices }: Props) {
  const brandOptions = useMemo<FacetOption[]>(() => {
    const set = new Set(
      devices
        .map((device) => device.brand)
        .filter((value): value is string => Boolean(value)),
    );
    return [...set].sort().map((value) => ({ label: value, value }));
  }, [devices]);

  const romOptions = useMemo<FacetOption[]>(() => {
    const map = new Map<string, string>();
    for (const device of devices) {
      for (const rom of device.roms) map.set(rom.id, rom.name);
    }
    return [...map.entries()]
      .map(([value, label]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [devices]);

  const columns = useMemo<ColumnDef<BrowseDevice>[]>(
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
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device" />
        ),
        cell: ({ row }) => {
          const name = row.original.name ?? row.original.codename;
          return (
            <div className="flex min-w-0 flex-col">
              <Link
                to={`/devices/${row.original.codename}`}
                prefetch="intent"
                title={name}
                className="truncate font-medium hover:underline"
              >
                {name}
              </Link>
              <span className="truncate font-mono text-xs text-muted-foreground md:hidden">
                {[row.original.codename, row.original.brand]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          );
        },
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
        id: "roms",
        accessorFn: (row) => row.roms.map((rom) => rom.id),
        header: "ROMs",
        enableSorting: false,
        filterFn: (row, id, value: string[]) =>
          (row.getValue(id) as string[]).some((value2) =>
            value.includes(value2),
          ),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            {row.original.roms.map((rom) => (
              <ChipLink key={rom.id} to={`/roms/${rom.id}`}>
                {rom.name}
              </ChipLink>
            ))}
          </div>
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
      tableClassName="table-fixed min-w-[44rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [
          { id: "brand", desc: false },
          { id: "name", desc: false },
        ],
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
          {table.getColumn("brand") && (
            <DataTableFacetedFilter
              column={table.getColumn("brand")!}
              title="Brand"
              options={brandOptions}
            />
          )}
          {table.getColumn("roms") && (
            <DataTableFacetedFilter
              column={table.getColumn("roms")!}
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
