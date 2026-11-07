const BASE_URL =
  "https://raw.githubusercontent.com/CandyRoms/official_devices/c11/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch CandyRoms devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
