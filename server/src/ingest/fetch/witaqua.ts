const BASE_URL =
  "https://raw.githubusercontent.com/WitAqua/WitAquaOTA/main/data/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch WitAqua devices: ${response.statusText}`);
  }

  return await response.text();
}
