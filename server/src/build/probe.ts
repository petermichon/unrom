// One HTTP probe for every reference check. Both gates must agree on what
// "dead" means and on how many requests a host may see, so the policy lives
// here rather than in either script.
//
// 404/410 mean gone. Everything else (403 bot walls, 429, 5xx, timeouts) is
// unknown: it must not demote a citation.

export const TIMEOUT_MS = 15_000;
export const HOST_CONCURRENCY = 4;
export const URL_CONCURRENCY_PER_HOST = 2;

export interface Probe {
  status: number | null;
  error: string | null;
}

export type State = "ok" | "dead" | "unknown";

export async function probe(url: string): Promise<Probe> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "user-agent": "unrom-reference-check/1.0 (+https://unrom.com)",
      },
    });
    await response.body?.cancel();
    return { status: response.status, error: null };
  } catch (error) {
    return {
      status: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function classify(probe: Probe): State {
  if (probe.status === 404 || probe.status === 410) return "dead";
  if (probe.status !== null && probe.status >= 200 && probe.status < 400) {
    return "ok";
  }
  return "unknown";
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "(invalid)";
  }
}

/** Run `task` over `items`, at most `limit` at a time. */
export async function pool<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const item = items[next++];
        await task(item);
      }
    },
  );
  await Promise.all(workers);
}

export async function mapByHost<T>(
  items: T[],
  host: (item: T) => string,
  perHost: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = host(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  await pool([...groups.values()], HOST_CONCURRENCY, (group) =>
    pool(group, perHost, task),
  );
}
