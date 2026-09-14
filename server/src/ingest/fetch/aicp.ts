const BASE_URL =
  "https://raw.githubusercontent.com/AICP/vendor_jenkins/w16.0/aicp-build-targets";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(`Failed to fetch AICP devices: ${response.statusText}`);
  }

  return await response.text();
}
