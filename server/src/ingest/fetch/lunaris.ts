import { fetchJson, fetchText, mapLimit } from "./util.ts";

// `16.2` is the active release branch; `builds/` holds one JSON per device
// (the `builds/vanilla/` subdirectory holds the GMS-free variants).
const BASE_URL =
  "https://api.github.com/repos/Lunaris-AOSP/OTA/contents/builds?ref=16.2";

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
  html_url: string;
}

interface OtaFile {
  response?: Array<Record<string, unknown>>;
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
        const data = JSON.parse(await fetchText(file.download_url)) as OtaFile;
        const latest = data.response?.[0];
        if (!latest) return null;
        return {
          ...latest,
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
      `Failed to fetch Lunaris AOSP devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
