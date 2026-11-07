const BASE_URL = "https://doc.e.foundation/devices";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch /e/OS devices: ${response.statusText}`);
  }

  return await response.text();
}
