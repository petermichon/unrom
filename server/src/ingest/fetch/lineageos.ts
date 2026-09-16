import { fetchJson, fetchText, mapLimit } from "./util.ts";

const BASE_URL =
  "https://api.github.com/repos/LineageOS/lineage_wiki/contents/_data/devices";

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
}

/**
 * The wiki holds one YAML file per device (and per variant). We list the
 * directory once, then download each file from its raw URL — only the listing
 * counts against the GitHub API rate limit.
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

    return JSON.stringify(
      documents.filter((document): document is string => document !== null),
    );
  } catch (error) {
    return new Error(
      `Failed to fetch LineageOS devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
