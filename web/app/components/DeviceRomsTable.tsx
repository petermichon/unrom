import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, PackageOpen } from "lucide-react";
import { Link } from "react-router";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bySortKey, referenceLabel } from "@/lib/sort";
import type { RomSupport } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["referenceUrl"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  roms: RomSupport[];
  /** The API response for this device, offered when the table is empty. */
  apiEndpoint?: string;
}

export default function DeviceRomsTable({ roms, apiEndpoint }: Props) {
  const columns = useMemo<ColumnDef<RomSupport>[]>(
    () => [
      {
        id: "search",
        accessorFn: (row) => row.name,
        filterFn: "includesString",
        enableSorting: false,
        enableHiding: false,
        cell: () => null,
      },
      {
        accessorKey: "name",
        meta: { title: "ROM" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ROM" />
        ),
        sortingFn: (a, b) => bySortKey(a.original.name, b.original.name),
        cell: ({ row }) => (
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex min-w-0 items-center gap-2">
              <Link
                to={`/roms/${row.original.id}`}
                prefetch="intent"
                title={row.original.name}
                className="w-fit max-w-full truncate font-medium hover:underline"
              >
                {row.original.name}
              </Link>
              {row.original.inheritedFrom && (
                <span
                  className="shrink-0 text-xs text-muted-foreground"
                  title={`Supports this device via its ${row.original.inheritedFrom} build`}
                >
                  via {row.original.inheritedFrom}
                </span>
              )}
            </span>
            {row.original.referenceUrl && (
              <a
                href={row.original.referenceUrl}
                target="_blank"
                rel="noreferrer"
                title={row.original.referenceUrl}
                className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground md:hidden"
              >
                <span className="truncate">
                  {referenceLabel(row.original.referenceUrl)}
                </span>
                {row.original.referenceKind === "derived" && (
                  <span
                    className="shrink-0 text-[11px] text-derived"
                    title="Built from the codename; the source does not publish this URL."
                  >
                    generated
                  </span>
                )}
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
              </a>
            )}
          </span>
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
                {row.original.referenceKind === "derived" && (
                  <span className="shrink-0 text-[11px] text-derived">
                    generated
                  </span>
                )}
                <ExternalLink className="size-3 shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md break-all">
                {row.original.referenceUrl}
                {row.original.referenceKind === "derived" && (
                  <span className="mt-1 block text-muted-foreground">
                    Built from the codename; the source does not publish this
                    URL.
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground">None</span>
          ),
      },
    ],
    [],
  );

  if (roms.length === 0) {
    return (
      <Empty className="h-64">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpen />
          </EmptyMedia>
          <EmptyTitle>No ROM data yet</EmptyTitle>
          <EmptyDescription>
            unrom tracks this device, but no custom ROM reports a build for it
            yet.{" "}
            <Link to="/devices" prefetch="intent">
              Browse devices that have ROM data
            </Link>
            {apiEndpoint && (
              <>
                {" "}
                or{" "}
                <a href={apiEndpoint}>open the API response for this device</a>
              </>
            )}
            .
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={roms}
      columnClassName={columnClassName}
      columnWidths={{ name: "md:w-[42%]", referenceUrl: "md:w-[58%]" }}
      paginate={false}
      countLabel={(count) => `${count} ${count === 1 ? "ROM" : "ROMs"}`}
      tableClassName="md:min-w-[36rem]"
      initialState={{
        columnVisibility: { search: false },
        sorting: [{ id: "name", desc: false }],
      }}
      toolbar={(table) => (
        <DataTableToolbar>
          <SearchInput
            id="device-roms-search"
            value={
              (table.getColumn("search")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table.getColumn("search")?.setFilterValue(value)
            }
            placeholder="Filter ROMs…"
            ariaLabel="Filter ROMs"
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
