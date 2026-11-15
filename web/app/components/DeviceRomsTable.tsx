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
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { formatDate, formatMonth } from "@/lib/dates";
import { bySortKey, referenceLabel } from "@/lib/sort";
import type { RomStatus, RomSupport } from "@/lib/types";

const MOBILE_HIDDEN = new Set(["referenceUrl"]);
const columnClassName = (id: string) =>
  MOBILE_HIDDEN.has(id) ? "hidden md:table-cell" : undefined;

interface Props {
  roms: RomSupport[];
  /** ROM id → catalogue status; only a discontinued project is called out. */
  statuses?: Record<string, RomStatus>;
  /** The API response for this device, offered when the table is empty. */
  apiEndpoint?: string;
}

export default function DeviceRomsTable({
  roms,
  statuses = {},
  apiEndpoint,
}: Props) {
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
              {statuses[row.original.id] === "discontinued" && (
                <StatusPill status="discontinued" />
              )}
            </span>
            {row.original.referenceUrl && (
              <a
                href={row.original.referenceUrl}
                target="_blank"
                rel="noopener"
                title={row.original.referenceUrl}
                className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground md:hidden"
              >
                <span className="truncate">
                  {referenceLabel(row.original.referenceUrl)}
                </span>
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
              </a>
            )}
          </span>
        ),
      },
      {
        id: "build",
        accessorFn: (row) => row.build?.date ?? undefined,
        meta: { title: "Build" },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Build" />
        ),
        // A date is a fact; "not published" is unknown, not the oldest. Keep
        // the unknown rows last whichever direction the column is sorted.
        sortUndefined: "last",
        sortDescFirst: true,
        cell: ({ row }) => <BuildCell build={row.original.build} />,
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
            <a
              href={row.original.referenceUrl}
              target="_blank"
              rel="noopener"
              title={row.original.referenceUrl}
              aria-label={`Open reference: ${row.original.referenceUrl}`}
              className="inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <span className="truncate">
                {referenceLabel(row.original.referenceUrl)}
              </span>
              <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-muted-foreground">None</span>
          ),
      },
    ],
    [statuses],
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
      columnWidths={{
        name: "md:w-[34%]",
        build: "md:w-[26%]",
        referenceUrl: "md:w-[40%]",
      }}
      paginate={false}
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
          {table.getFilteredRowModel().rows.length <
            table.getCoreRowModel().rows.length && (
            <CountStatus
              count={table.getFilteredRowModel().rows.length}
              total={table.getCoreRowModel().rows.length}
              noun="ROM"
            />
          )}
        </DataTableToolbar>
      )}
    />
  );
}

/**
 * Filtered row count for the toolbar. Only shown while a filter is active, so
 * it never repeats the page's own total and always says something new.
 */
function CountStatus({
  count,
  total,
  noun,
}: {
  count: number;
  total: number;
  noun: string;
}) {
  const label = (value: number) =>
    `${value} ${value === 1 ? noun : `${noun}s`}`;
  return (
    <span
      role="status"
      aria-live="polite"
      className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums"
    >
      {count} of {label(total)}
    </span>
  );
}

/**
 * The newest build the source lists, with the patch level its build reports.
 * The exact `YYYY-MM-DD` stays in `dateTime`/`title`; the visible label is
 * formatted for reading. "Not published" is a fact about the source, never a
 * verdict on the build.
 */
function BuildCell({ build }: { build: RomSupport["build"] }) {
  if (!build?.date && !build?.securityPatch) {
    return <span className="text-xs text-muted-foreground">Not published</span>;
  }

  return (
    <span className="flex flex-col gap-0.5 text-xs tabular-nums">
      {build.date && (
        <time dateTime={build.date} title={build.date}>
          {formatDate(build.date)}
        </time>
      )}
      <span
        className="text-muted-foreground"
        title={build.securityPatch ?? undefined}
      >
        {build.securityPatch
          ? `patch ${formatMonth(build.securityPatch)}`
          : "patch not published"}
      </span>
    </span>
  );
}
