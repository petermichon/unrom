import { fetchJson, fetchText, mapLimit } from "./util.ts";

// `main` holds one build JSON per device under `builds/`. The project stalled on
// Android 13 (last builds 2023), but the roster is still a valid compatibility
// record and every device carries an XDA thread citation.
const BASE_URL =
  "https://api.github.com/repos/PixelExtended/OTA/contents/builds?ref=main";

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
  html_url: string;
}

export async function listDevices(): Promise<string | Error> {
  try {
    const files = await fetchJson<GitHubFile[]>(BASE_URL);
    const devices = files.filter(
      (file) =>
        file.type === "file" &&
        file.name.endsWith(".json") &&
        file.download_url !== null,
    );

    const builds = await mapLimit(devices, 8, async (file) => {
      if (!file.download_url) return null;
      try {
        const build = JSON.parse(await fetchText(file.download_url)) as Record<
          string,
          unknown
        >;
        return {
          ...build,
          codename: file.name.replace(/\.json$/, ""),
          sourceUrl: file.html_url,
        };
      } catch (error) {
        console.error(
          `Failed to fetch ${file.name}: ${
            error instanceof Error ? error.message : error
          }`,
        );
        return null;
      }
    });

    return JSON.stringify(builds.filter((build) => build !== null));
  } catch (error) {
    return new Error(
      `Failed to fetch PixelExtended devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
