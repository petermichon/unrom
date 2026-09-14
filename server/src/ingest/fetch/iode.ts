const BASE_URL =
  "https://gitlab.iode.tech/api/v4/projects/ota%2Frelease/repository/tree?recursive=true";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch iodéOS devices: ${response.statusText}`);
  }

  return await response.text();
}
