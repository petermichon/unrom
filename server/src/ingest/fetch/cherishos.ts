const BASE_URL = "https://www.cherishos.com/api/devices";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch CherishOS devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
