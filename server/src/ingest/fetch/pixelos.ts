const BASE_URL =
  "https://raw.githubusercontent.com/PixelOS-AOSP/official_devices/sixteen/API/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch PixelOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
