import { parse as parseYaml } from "yaml";

import { fetchJson, fetchText, mapLimit } from "./util.ts";

const BASE_URL =
  "https://api.github.com/repos/LineageOS/lineage_wiki/contents/_data/devices";
// The OTA host answers one device at a time; the wiki roster is the list of
// codenames to ask about.
const BUILDS_URL = "https://download.lineageos.org/api/v2/devices";

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
}

interface BuildFile {
  date?: unknown;
  datetime?: unknown;
  os_patch_level?: unknown;
}

interface BuildGroup {
  date?: unknown;
  datetime?: unknown;
  files?: unknown;
}

export interface LatestBuild {
  codename: string;
  date: string | null;
  securityPatch: string | null;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function asDate(value: unknown): string | null {
  return typeof value === "string" && DATE.test(value) ? value : null;
}

function asTime(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * The newest build the OTA API lists for a device, with the security patch
 * level that build reports. An empty list means the device has no current
 * build, which is not an error.
 */
function latestBuild(codename: string): Promise<LatestBuild | null> {
  return fetchJson<BuildGroup[]>(
    `${BUILDS_URL}/${encodeURIComponent(codename)}/builds`,
  ).then((groups) => {
    if (!Array.isArray(groups) || groups.length === 0) return null;

    const newestGroup = groups.reduce((best, group) =>
      asTime(group?.datetime) > asTime(best?.datetime) ? group : best,
    );
    const files = (Array.isArray(newestGroup.files) ? newestGroup.files : [])
      .filter((file): file is BuildFile => !!file && typeof file === "object")
      .sort((a, b) => asTime(b.datetime) - asTime(a.datetime));
    const file = files[0] ?? null;

    return {
      codename,
      date: asDate(file?.date) ?? asDate(newestGroup.date),
      securityPatch: asDate(file?.os_patch_level),
    };
  });
}

/**
 * The wiki holds one YAML file per device (and per variant). We list the
 * directory once, then download each file from its raw URL; only the listing
 * counts against the GitHub API rate limit. Each device's newest OTA build is
 * fetched from the download host, which is where the build date and security
 * patch level live.
 */
export async function listDevices(): Promise<string | Error> {
  try {
    const files = await fetchJson<GitHubFile[]>(BASE_URL);
    const devices = files.filter(
      (file) =>
        file.type === "file" &&
        file.name.endsWith(".yml") &&
        file.download_url !== null,
    );

    const documents = await mapLimit(devices, 8, async (file) => {
      if (!file.download_url) return null;
      try {
        return await fetchText(file.download_url);
      } catch (error) {
        console.error(
          `Failed to fetch ${file.name}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    // A codename can appear in several documents (one per variant); the OTA
    // host answers per codename, so ask once.
    const codenames = [
      ...new Set(
        documents
          .filter((document): document is string => document !== null)
          .map((document) => {
            const meta = parseYaml(document) as Record<string, unknown> | null;
            return typeof meta?.codename === "string" ? meta.codename : null;
          })
          .filter((codename): codename is string => codename !== null),
      ),
    ];

    const builds = await mapLimit(codenames, 6, async (codename) => {
      try {
        return await latestBuild(codename);
      } catch (error) {
        console.error(
          `Failed to fetch builds for ${codename}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    return JSON.stringify({
      documents: documents.filter(
        (document): document is string => document !== null,
      ),
      builds: builds.filter((build): build is LatestBuild => build !== null),
    });
  } catch (error) {
    return new Error(
      `Failed to fetch LineageOS devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
