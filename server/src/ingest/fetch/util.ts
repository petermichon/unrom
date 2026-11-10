export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

/** Run `fn` over `items` with at most `limit` promises in flight. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, worker));
  return results;
}

interface TreeEntry {
  path?: unknown;
  type?: unknown;
}

/** Fetch one upstream document and wrap failures with the source name. */
export async function fetchSource(
  label: string,
  url: string,
): Promise<string | Error> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${url}: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`Failed to fetch ${label} devices: ${message}`);
  }
}

/**
 * Snapshot every file in a repository that matches `file`. One tree request
 * lists the paths, then raw.githubusercontent.com serves the documents, so the
 * GitHub API limit is one call per repository. Each document keeps its path so
 * the parser can read the codename from the directory or file name.
 *
 * `json: false` stores the raw text per file instead of parsing it, for
 * upstream files that are not valid JSON.
 */
export async function fetchTreeSnapshot(options: {
  repo: string;
  branch: string;
  file: RegExp;
  label: string;
  json?: boolean;
}): Promise<string | Error> {
  try {
    const treeResponse = await fetch(
      `https://api.github.com/repos/${options.repo}/git/trees/${options.branch}?recursive=1`,
      { headers: { accept: "application/vnd.github+json" } },
    );
    if (!treeResponse.ok) {
      throw new Error(
        `${treeResponse.status} ${treeResponse.statusText}`.trim(),
      );
    }

    const tree = (await treeResponse.json()) as {
      tree?: TreeEntry[];
      truncated?: boolean;
    };
    if (tree.truncated) throw new Error("repository tree is truncated");

    const paths = (tree.tree ?? [])
      .map((entry) => entry.path)
      .filter(
        (path): path is string =>
          typeof path === "string" && options.file.test(path),
      )
      .sort();
    if (paths.length === 0) {
      throw new Error("no device files in the repository tree");
    }

    const files = await mapLimit(paths, 6, async (path) => {
      const response = await fetch(
        `https://raw.githubusercontent.com/${options.repo}/${options.branch}/${path
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`,
      );
      if (!response.ok) {
        throw new Error(`${path}: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      return options.json === false
        ? { path, text }
        : { path, device: JSON.parse(text) };
    });

    return JSON.stringify({ files });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`Failed to fetch ${options.label} devices: ${message}`);
  }
}
