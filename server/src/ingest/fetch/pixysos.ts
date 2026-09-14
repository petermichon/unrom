const BASE_URL =
  "https://raw.githubusercontent.com/PixysOS/official_devices/master/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch PixysOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
