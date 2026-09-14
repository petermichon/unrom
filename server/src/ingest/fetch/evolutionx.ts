const BASE_URL =
  "https://api.github.com/repos/Evolution-X/OTA/contents/builds";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Evolution X devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
