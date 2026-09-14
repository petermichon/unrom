const BASE_URL =
  "https://raw.githubusercontent.com/Kenvyra/website/main/src/devices";
const DEVICES = ["cupid", "davinci", "lisa", "sweet"];

export async function listDevices(): Promise<string | Error> {
  const devices: string[] = [];

  for (const codename of DEVICES) {
    const response = await fetch(`${BASE_URL}/${codename}.md`);
    if (!response.ok) {
      console.error(
        `Failed to fetch device ${codename}: ${response.statusText}`,
      );
      continue;
    }
    const text = await response.text();
    devices.push(text);
  }

  return JSON.stringify(devices);
}
