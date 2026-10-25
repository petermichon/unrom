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
import type { RegistryEntry } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["names", "confidence"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  entries: RegistryEntry[];
}

export default function RegistryTable({ entries }: Props) {
  const vendorOptions = useMemo<FacetOption[]>(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const entry of entries) {
      const item = counts.get(entry.vendor) ?? {
        name: entry.vendorName,
        count: 0,
      };
      item.count++;
      counts.set(entry.vendor, item);
    }
    return [...counts]
      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
      .map(([value, item]) => ({ label: item.name, value }));
  }, [entries]);

  const columns = useMemo<ColumnDef<RegistryEntry>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) =>
          [row.name, ...row.names, row.codename, row.vendor, row.vendorName]
            .filter(Boolean)
            .join(" "),
        filterFn: "includesString",
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
      {
        id: "vendor",
        accessorFn: (row) => row.vendorName,
        meta: { title: "Vendor" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vendor" />
        ),
        cell: ({ row }) => (
          <Link
            to={`/devices/${row.original.vendor}`}
            prefetch="intent"
            className="w-fit max-w-full truncate text-muted-foreground hover:text-foreground hover:underline"
          >
            {row.original.vendorName}
          </Link>
        ),
        filterFn: (row, _id, value: string[]) =>
          value.includes(row.original.vendor),
      },
      {
        id: "codename",
        accessorFn: (row) => row.codename,
        meta: { title: "Codename" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Codename" />
        ),
        cell: ({ row }) =>
          row.original.supported ? (
            <Link
              to={`/devices/${row.original.vendor}/${row.original.codename}`}
              prefetch="intent"
              className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {row.original.codename}
            </Link>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.codename}
            </span>
          ),
      },
      {
        id: "device",
        accessorFn: (row) => row.name ?? row.codename,
        meta: { title: "Device" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Device" />
        ),
        cell: ({ row }) =>
          row.original.supported ? (
            <Link
              to={`/devices/${row.original.vendor}/${row.original.codename}`}
              prefetch="intent"
              className="w-fit max-w-full truncate font-medium hover:underline"
            >
              {row.original.name ?? row.original.codename}
            </Link>
          ) : (
            <span className="block truncate font-medium">
              {row.original.name ?? row.original.codename}
            </span>
          ),
      },
      {
        id: "confidence",
        accessorFn: (row) => row.confidence,
        meta: { title: "Confidence" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Confidence" />
        ),
        cell: ({ row }) => {
          const labels = {
            verified: "Verified",
            inferred: "Inferred",
            manual: "Manual",
            unverified: "Unverified",
          } as const;
          return (
            <span
              className="text-muted-foreground"
              title={
                row.original.sources.length > 0
                  ? `Sources: ${row.original.sources.join(", ")}`
                  : undefined
              }
            >
              {labels[row.original.confidence]}
            </span>
          );
        },
      },
      {
        id: "names",
        accessorFn: (row) => row.names.join(" / "),
        meta: { title: "Names" },
        enableSorting: false,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Names" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-normal break-words">
            {row.original.names.length > 0
              ? row.original.names.join(" / ")
              : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={entries}
      columnClassName={columnClassName}
      tableClassName="min-w-[36rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "vendor", desc: false }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="registry-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter by name or codename…"
            ariaLabel="Filter the registry"
          />
          {table.getColumn("vendor") && (
            <DataTableFacetedFilter
              column={table.getColumn("vendor")!}
              title="Vendor"
              options={vendorOptions}
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
