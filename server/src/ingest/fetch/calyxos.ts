const BASE_URL = "https://calyxos.org/install/";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch CalyxOS devices: ${response.statusText}`);
  }

  return await response.text();
}
