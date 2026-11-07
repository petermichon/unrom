const BASE_URL =
  "https://raw.githubusercontent.com/AospExtended/official_devices/main/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch AospExtended devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
