const BASE_URL =
  "https://raw.githubusercontent.com/GenesisOS/Website-Data/v2/devices/DeviceList.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch GenesisOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
