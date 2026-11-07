// Union the current Android 17 branch with the older Android 16 branch so
// devices that have not moved forward stay covered.
const REFS = ["17", "16"] as const;
const CONTENTS_URL = (ref: string) =>
  `https://api.github.com/repos/ProjectInfinity-X/official_devices/contents/devices?ref=${ref}`;

interface GitHubFile {
  name: string;
  download_url: string | null;
  type: string;
}

export async function listDevices(): Promise<string | Error> {
  try {
    const files = new Map<string, GitHubFile>();

    for (const ref of REFS) {
      const response = await fetch(CONTENTS_URL(ref));
      if (!response.ok) {
        return new Error(
          `Failed to fetch Project Infinity X ${ref} device list: ${response.statusText}`,
        );
      }

      const entries = (await response.json()) as GitHubFile[];
      for (const entry of entries) {
        if (entry.type !== "file" || !entry.name.endsWith(".json")) continue;
        if (!entry.download_url) continue;
        const key = entry.name.toLowerCase();
        if (files.has(key)) continue;
        files.set(key, entry);
      }
    }

    const devices: unknown[] = [];
    for (const file of files.values()) {
      if (!file.download_url) continue;
      try {
        const deviceResponse = await fetch(file.download_url);
        if (!deviceResponse.ok) {
          console.error(
            `Failed to fetch device ${file.name}: ${deviceResponse.statusText}`,
          );
          continue;
        }
        devices.push(await deviceResponse.json());
      } catch (error) {
        console.error(`Error parsing device ${file.name}:`, error);
      }
    }

    return JSON.stringify(devices);
  } catch (error) {
    return new Error(
      `Failed to fetch Project Infinity X devices: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
}
