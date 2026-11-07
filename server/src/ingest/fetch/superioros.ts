const REPO = "SuperiorOS-Devices/official_devices";
const BRANCH = "fourteen";
const TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

/**
 * SuperiorOS keeps one OTA JSON per device. Fetch the tree once, then embed
 * each device's upstream payload in a single snapshot so the normalizer has
 * one file to read.
 */
export async function listDevices(): Promise<string | Error> {
  const treeResponse = await fetch(TREE_URL, {
    headers: { accept: "application/vnd.github+json" },
  });
  if (!treeResponse.ok) {
    return new Error(
      `Failed to list SuperiorOS devices: ${treeResponse.statusText}`,
    );
  }

  const tree = (await treeResponse.json()) as {
    tree?: Array<{ path?: string }>;
  };
  const files = (tree.tree ?? [])
    .map((entry) => entry.path)
    .filter((path): path is string => Boolean(path))
    .filter((path) => /^[^/]+\.json$/.test(path))
    .sort();

  const devices = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(`${RAW_BASE}/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
      }
      return { file, raw: await response.json() };
    }),
  );

  return JSON.stringify(
    {
      source: `https://github.com/${REPO}/tree/${BRANCH}`,
      devices,
    },
    null,
    2,
  );
}
