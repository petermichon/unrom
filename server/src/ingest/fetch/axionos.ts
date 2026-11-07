const BASE_URL =
  "https://raw.githubusercontent.com/AxionAOSP/official_devices/main/api/downloads.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch AxionOS devices: ${response.statusText}`);
  }

  return await response.text();
}
