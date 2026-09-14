const BASE_URL =
  "https://thecloverproject.com/api/github/The-Clover-Project/TheCloverProject.com/main/data/devices.json";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Clover devices: ${response.statusText}`,
    );
  }

  const text = await response.text();
  return text;
}
