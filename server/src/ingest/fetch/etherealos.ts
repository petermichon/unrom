// The A14 roster is a clean array; the older A13 file is truncated upstream, so
// pin the branch that parses.
const BASE_URL =
  "https://raw.githubusercontent.com/Ethereal-OS/Ethereal-Devices/A14/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch EtherealOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
