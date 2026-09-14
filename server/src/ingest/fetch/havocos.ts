const BASE_URL =
  "https://raw.githubusercontent.com/Havoc-OS/Devices/thirteen/devices";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch HavocOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
