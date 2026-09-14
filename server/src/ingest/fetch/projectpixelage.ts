const BASE_URL =
  "https://api.github.com/repos/ProjectPixelage/pixelage_ota/contents/devices";

interface GitHubFile {
  name: string;
  download_url: string;
  type: string;
}

interface Device {
  datetime: number;
  filename: string;
  id: string;
  romtype: string;
  size: number;
  url: string;
  version: string;
}

export async function listDevices(): Promise<string | Error> {
  // Step 1: List all device files in the directory
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Project PixelAge device list: ${response.statusText}`,
    );
  }

  const files = (await response.json()) as GitHubFile[];

  // Filter only JSON files
  const jsonFiles = files.filter(
    (file) => file.type === "file" && file.name.endsWith(".json"),
  );

  const devices: Device[] = [];

  // Step 2: Fetch each device JSON file
  for (const file of jsonFiles) {
    try {
      const deviceResponse = await fetch(file.download_url);
      if (!deviceResponse.ok) {
        console.error(
          `Failed to fetch device ${file.name}: ${deviceResponse.statusText}`,
        );
        continue;
      }

      const text = await deviceResponse.text();
      if (!text || text.trim() === "") {
        console.warn(`Skipping empty device file: ${file.name}`);
        continue;
      }

      const data = JSON.parse(text);
      if (data.response && data.response.length > 0) {
        // Add codename from filename (remove .json extension)
        const device: Device = {
          ...data.response[0],
          codename: file.name.replace(".json", ""),
        };
        devices.push(device);
      }
    } catch (error) {
      console.error(`Error parsing device ${file.name}:`, error);
    }
  }

  return JSON.stringify(devices);
}
