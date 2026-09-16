export async function listDevices(): Promise<string | Error> {
  const url =
    "https://raw.githubusercontent.com/BlissRoms-Devices/official-devices/master/devices.json";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}
