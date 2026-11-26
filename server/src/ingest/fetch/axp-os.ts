import { fetchWithTimeout as fetch } from "./util.ts";

// The project's site mirror (a GitHub mirror of code.binbash.rocks). Its own
// sitemap is unreachable while axpos.org's nameservers are down, so the roster
// is read from the tree the site is rendered from: one
// `content/devices/<Brand>/<codename>.md` per supported device.
const TREE_URL =
  "https://api.github.com/repos/AXP-OS/axpos-org/git/trees/hugo?recursive=1";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(TREE_URL, {
    headers: { accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    return new Error(
      `Failed to list AXP.OS devices: ${response.status} ${response.statusText}`,
    );
  }

  return await response.text();
}
