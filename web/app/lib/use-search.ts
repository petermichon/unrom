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
  const [errorQuery, setErrorQuery] = useState<string | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    const q = trimmed;
    if (!q) return;

    let cancelled = false;
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
          }
          return response.json() as Promise<SearchResponse>;
        })
        .then((result) => {
          if (cancelled) return;
          setErrorQuery(null);
          setData(result);
        })
        .catch(() => {
          if (!cancelled) setErrorQuery(q);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, SEARCH_DELAY);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  return trimmed
    ? { data, loading, error: errorQuery === trimmed }
    : { data: EMPTY, loading: false, error: false };
}
