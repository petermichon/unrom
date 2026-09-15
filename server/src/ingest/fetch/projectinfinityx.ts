const BASE_URL =
  "https://api.github.com/repos/ProjectInfinity-X/official_devices/contents/devices?ref=16";

interface GitHubFile {
  name: string;
  download_url: string | null;
  type: string;
}

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Project Infinity X device list: ${response.statusText}`
    );
  }

  const files = (await response.json()) as GitHubFile[];
  const jsonFiles = files.filter(
    (file) => file.type === "file" && file.name.endsWith(".json")
  );

  const devices: unknown[] = [];
  for (const file of jsonFiles) {
    if (!file.download_url) continue;
    try {
      const deviceResponse = await fetch(file.download_url);
      if (!deviceResponse.ok) {
        console.error(
          `Failed to fetch device ${file.name}: ${deviceResponse.statusText}`
        );
        continue;
      }
      devices.push(await deviceResponse.json());
    } catch (error) {
      console.error(`Error parsing device ${file.name}:`, error);
    }
  }

  return JSON.stringify(devices);
}
