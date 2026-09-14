const BASE_URL =
  "https://raw.githubusercontent.com/DroidX-UI-Devices/vendor_droidxOTA/15/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch DroidX-UI devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
