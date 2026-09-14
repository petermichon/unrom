const BASE_URL =
  "https://raw.githubusercontent.com/ArrowOS/arrow_infrastructure_devices/arrow-13.1/arrow.devices";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch ArrowOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
