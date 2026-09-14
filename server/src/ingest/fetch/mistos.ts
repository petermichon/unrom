const BASE_URL =
  "https://raw.githubusercontent.com/MistOS-Devices/official_devices/16.2/buildDevices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch MistOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
