const BASE_URL =
  "https://api.github.com/repos/LineageOS/lineage_wiki/contents/_data/devices";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch device list: ${response.statusText}`);
  }

  return await response.text();
}
