const BASE_URL =
  "https://gitlab.com/kalilinux/nethunter/build-scripts/kali-nethunter-kernels/-/raw/main/devices.yml";

export async function listDevices(): Promise<string | Error> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    return new Error(
      `Failed to fetch Kali NetHunter devices: ${response.statusText}`,
    );
  }

  return await response.text();
}
