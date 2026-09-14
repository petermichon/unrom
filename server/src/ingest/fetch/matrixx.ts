const BASE_URL =
  "https://raw.githubusercontent.com/Matrixx-Devices/official_devices/16.0/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Project Matrixx devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
