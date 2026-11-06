import { useEffect, useState } from "react";
import type { SearchResponse } from "@/lib/types";

const EMPTY: SearchResponse = {
  devices: [],
  brands: [],
  roms: [],
  totals: { devices: 0, brands: 0, roms: 0 },
};

const SEARCH_DELAY = 120;

/**
 * Server-side grouped search. Debounced, abortable, and safe against responses
 * landing after the query changed.
 */
export function useSearch(query: string) {
  const [data, setData] = useState<SearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;

    let cancelled = false;
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((response) =>
          response.ok ? (response.json() as Promise<SearchResponse>) : EMPTY,
        )
        .then((result) => {
          if (!cancelled) setData(result);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, SEARCH_DELAY);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return query.trim() ? { data, loading } : { data: EMPTY, loading: false };
}
