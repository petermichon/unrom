const BASE_URL =
  "https://raw.githubusercontent.com/RisingOS-Revived/official_devices/fifteen/devices.md";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch RisingOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
