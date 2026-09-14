const BASE_URL =
  "https://raw.githubusercontent.com/AfterlifeOS/device_afterlife_ota/16.2/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch AfterlifeOS devices: ${response.statusText}`,
    );
  }

  const text = await response.text();
  return text;
}
