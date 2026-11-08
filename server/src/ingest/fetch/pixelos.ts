// Every official device has its own file under API/devices/. List the branch
// tree once, then fetch the files directly from raw.githubusercontent.com.
const REPO = "PixelOS-AOSP/official_devices";
const BRANCH = "seventeen";
const TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

interface TreeEntry {
  path?: unknown;
  type?: unknown;
}

async function get(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: { accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    throw new Error(`${url}: ${response.status} ${response.statusText}`.trim());
  }
  return response;
}

export async function listDevices(): Promise<string | Error> {
  try {
    const tree = (await (await get(TREE_URL)).json()) as { tree?: TreeEntry[] };
    const paths = (tree.tree ?? [])
      .map((entry) => entry.path)
      .filter(
        (path): path is string =>
          typeof path === "string" && /^API\/devices\/[^/]+\.json$/.test(path),
      )
      .sort();

    if (paths.length === 0) {
      throw new Error("no device files in the repository tree");
    }

    const devices = await Promise.all(
      paths.map(async (path) => {
        const response = await get(`${RAW_URL}/${path}`);
        return await response.json();
      }),
    );

    return JSON.stringify({ devices });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Error(`Failed to fetch PixelOS devices: ${message}`);
  }
}
