import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { SortingState, VisibilityState } from "@tanstack/react-table";

const SORT_PARAM = "sort";
const HIDE_PARAM = "hide";

interface Options {
  /**
   * Columns the URL may sort by. Anything else is ignored, so an old or
   * hand-edited link cannot leave the table in a state the menu cannot leave.
   */
  sortable: readonly string[];
  /** Columns the View menu can hide, i.e. the ones the URL may hide. */
  hideable: readonly string[];
  /** Order used when the URL carries none. Keep it module-level for identity. */
  defaultSorting: SortingState;
  /** Columns that never show, such as the filter-only one. */
  alwaysHidden?: VisibilityState;
}

/** `sort=build.desc`, `sort=name`; a bare id is ascending. */
function parseSorting(
  raw: string | null,
  sortable: readonly string[],
): SortingState | null {
  if (!raw) return null;
  const [id, direction, extra] = raw.split(".");
  if (!id || extra !== undefined || !sortable.includes(id)) return null;
  if (direction !== undefined && direction !== "asc" && direction !== "desc") {
    return null;
  }
  return [{ id, desc: direction === "desc" }];
}

function serializeSorting(sorting: SortingState): string | null {
  const first = sorting[0];
  if (!first) return null;
  return first.desc ? `${first.id}.desc` : first.id;
}

/** `hide=referenceUrl,build`; ids arrive in column order when written. */
function parseHidden(
  raw: string | null,
  hideable: readonly string[],
): VisibilityState {
  const hidden: VisibilityState = {};
  if (!raw) return hidden;
  for (const id of raw.split(",")) {
    if (hideable.includes(id)) hidden[id] = false;
  }
  return hidden;
}

function serializeHidden(
  visibility: VisibilityState,
  hideable: readonly string[],
): string | null {
  // Column order, not click order, so the same view always writes one URL.
  const hidden = hideable.filter((id) => visibility[id] === false);
  return hidden.length > 0 ? hidden.join(",") : null;
}

/**
 * Sort and column visibility for a detail-page table, carried in the URL so a
 * sorted or trimmed view can be shared and survives back/forward. The filter
 * box stays local: it is a find-in-page control, not part of the view.
 *
 * Writes replace the history entry and keep the scroll position; the matching
 * routes opt out of loader revalidation for a query-only change.
 */
export function useTableUrlState({
  sortable,
  hideable,
  defaultSorting,
  alwaysHidden,
}: Options) {
  const [params, setParams] = useSearchParams();
  const currentSearch = params.toString();
  const sortRaw = params.get(SORT_PARAM);
  const hideRaw = params.get(HIDE_PARAM);

  const sorting = useMemo(
    () => parseSorting(sortRaw, sortable) ?? defaultSorting,
    [sortRaw, sortable, defaultSorting],
  );

  const columnVisibility = useMemo(
    () => ({ ...alwaysHidden, ...parseHidden(hideRaw, hideable) }),
    [hideRaw, hideable, alwaysHidden],
  );

  const write = useCallback(
    (next: URLSearchParams) => {
      setParams(next, { replace: true, preventScrollReset: true });
    },
    [setParams],
  );

  const onSortingChange = useCallback(
    (next: SortingState) => {
      const params = new URLSearchParams(currentSearch);
      const value = serializeSorting(next);
      const fallback = serializeSorting(defaultSorting);
      if (value === null || value === fallback) params.delete(SORT_PARAM);
      else params.set(SORT_PARAM, value);
      write(params);
    },
    [currentSearch, defaultSorting, write],
  );

  const onColumnVisibilityChange = useCallback(
    (next: VisibilityState) => {
      const params = new URLSearchParams(currentSearch);
      const value = serializeHidden(next, hideable);
      if (value === null) params.delete(HIDE_PARAM);
      else params.set(HIDE_PARAM, value);
      write(params);
    },
    [currentSearch, hideable, write],
  );

  return {
    sorting,
    onSortingChange,
    columnVisibility,
    onColumnVisibilityChange,
  };
}
