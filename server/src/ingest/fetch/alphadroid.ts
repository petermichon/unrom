const BASE_URL =
  "https://raw.githubusercontent.com/AlphaDroid-devices/official_devices/main/devices.md";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch AlphaDroid devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
