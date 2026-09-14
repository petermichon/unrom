const BASE_URL =
  "https://raw.githubusercontent.com/Project-Awaken/official_devices/ursa/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch AwakenOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
