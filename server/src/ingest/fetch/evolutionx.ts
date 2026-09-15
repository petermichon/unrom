import { fetchJson, fetchText, mapLimit } from "./util.ts";

// `bka` is the active build branch; the repository default branch is a stub.
const BASE_URL =
  "https://api.github.com/repos/Evolution-X/OTA/contents/builds?ref=bka";

interface GitHubFile {
  name: string;
  type: string;
  download_url: string | null;
}

interface BuildFile {
  response?: Array<Record<string, unknown>>;
}

/**
 * Each device has its own build JSON in `builds/`. We list the directory once,
 * then download each file from its raw URL, tagging the build with the codename
 * from the file name (the JSON itself does not include it).
 */
export async function listDevices(): Promise<string | Error> {
  try {
    const files = await fetchJson<GitHubFile[]>(BASE_URL);
    const devices = files.filter(
      (file) =>
        file.type === "file" &&
        file.name.endsWith(".json") &&
        file.download_url !== null
    );

    const builds = await mapLimit(devices, 8, async (file) => {
      if (!file.download_url) return null;
      try {
        const data = JSON.parse(await fetchText(file.download_url)) as BuildFile;
        const latest = data.response?.[0];
        if (!latest) return null;
        return { ...latest, codename: file.name.replace(/\.json$/, "") };
      } catch (error) {
        console.error(
          `Failed to fetch ${file.name}: ${
            error instanceof Error ? error.message : error
          }`
        );
        return null;
      }
    });

    return JSON.stringify(builds.filter((build) => build !== null));
  } catch (error) {
    return new Error(
      `Failed to fetch Evolution X devices: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}
