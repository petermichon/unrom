import { fetchJson, fetchText, mapLimit } from "./util.ts";

const REPO = "crdroidandroid/android_vendor_crDroidOTA";
const BRANCHES_URL = `https://api.github.com/repos/${REPO}/branches?per_page=100`;
const SITE_URL = "https://crdroid.net/downloads";

interface GitHubBranch {
  name: string;
}

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
  html_url: string;
}

interface OtaFile {
  response?: Array<Record<string, unknown>>;
}

// Device support lives across one branch per Android version. crdroid.net lists
// the union of every branch, so we do too — newest branch first, so a codename
// keeps its most recent build and forum link.
function versionRank(branch: string): number {
  const [major = 0, minor = 0] = branch.split(".").map(Number);
  return (
    (Number.isFinite(major) ? major : 0) * 1000 +
    (Number.isFinite(minor) ? minor : 0)
  );
}

/**
 * crdroid.net only publishes a per-device page for versions it actually built,
 * which can lag the OTA branch (e.g. `juice` sits on the Android 12 branch but
 * the site still lists crDroid 7). Scrape the downloads index once for each
 * device's highest published version so the citation resolves to a real device
 * page. Returns an empty map if the index cannot be read.
 */
async function siteVersions(): Promise<Map<string, number>> {
  const versions = new Map<string, number>();
  try {
    const html = await fetchText(SITE_URL);
    const parts = html.split(/id='([^']+)'>/);
    for (let index = 1; index < parts.length; index += 2) {
      const codename = parts[index];
      const chunk = parts[index + 1]?.slice(0, 1500) ?? "";
      const escaped = codename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const numbers = [
        ...chunk.matchAll(new RegExp(`href='${escaped}/(\\d+)'`, "g")),
      ].map((match) => Number(match[1]));
      if (numbers.length) versions.set(codename, Math.max(...numbers));
    }
  } catch (error) {
    console.error(
      `Failed to read ${SITE_URL}: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
  return versions;
}

/**
 * The OTA repository stores one `<codename>.json` file per supported device at
 * the root of each version branch. We list every branch once, keep the newest
 * file per codename, then download it from its raw URL, tagging the build with
 * the codename from the file name (the JSON itself does not include it).
 */
export async function listDevices(): Promise<string | Error> {
  try {
    const branches = await fetchJson<GitHubBranch[]>(BRANCHES_URL);
    const refs = branches
      .map((branch) => branch.name)
      .sort((a, b) => versionRank(b) - versionRank(a));

    const byCodename = new Map<string, { rawUrl: string; sourceUrl: string }>();
    for (const ref of refs) {
      let files: GitHubFile[];
      try {
        files = await fetchJson<GitHubFile[]>(
          `https://api.github.com/repos/${REPO}/contents?ref=${ref}`,
        );
      } catch (error) {
        console.error(
          `Failed to list ${ref}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        continue;
      }

      for (const file of files) {
        if (file.type !== "file" || !file.name.endsWith(".json")) continue;
        if (!file.download_url) continue;
        const codename = file.name.replace(/\.json$/, "");
        if (!byCodename.has(codename)) {
          byCodename.set(codename, {
            rawUrl: file.download_url,
            sourceUrl: file.html_url,
          });
        }
      }
    }

    const site = await siteVersions();
    const devices = [...byCodename.entries()];
    const builds = await mapLimit(devices, 8, async ([codename, file]) => {
      try {
        const data = JSON.parse(await fetchText(file.rawUrl)) as OtaFile;
        const latest = data.response?.[0];
        if (!latest) return null;
        // crDroid's download site exposes a deterministic per-device page keyed
        // by the major version (e.g. "12.11" -> https://crdroid.net/<codename>/12).
        const ota = /^\d+/.exec(String(latest.version ?? ""));
        const major = site.get(codename) ?? (ota ? Number(ota[0]) : undefined);
        return {
          ...latest,
          codename,
          sourceUrl: file.sourceUrl,
          devicePage: major ? `https://crdroid.net/${codename}/${major}` : null,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ${codename}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    return JSON.stringify(builds.filter((build) => build !== null));
  } catch (error) {
    return new Error(
      `Failed to fetch crDroid devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
