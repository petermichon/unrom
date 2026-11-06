export const PLAY_DEVICES_FILE = "play-devices.csv";

export interface CatalogDevice {
  brand: string;
  name: string;
  codename: string;
  model: string;
}

/**
 * Parse a CSV line, supporting quoted fields with embedded commas and quotes.
 */
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((field) => field.trim());
}

/**
 * Play's CSV: Retail Branding, Marketing Name, Device, Model. `Device` is
 * `Build.DEVICE`, i.e. the codename. Rows without a brand, name, or codename
 * cannot identify a device and are dropped.
 */
export function parsePlayDevices(raw: string): CatalogDevice[] {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const header = parseLine(lines[0] ?? "").map((cell) => cell.toLowerCase());
  const brandIndex = header.indexOf("retail branding");
  const nameIndex = header.indexOf("marketing name");
  const codenameIndex = header.indexOf("device");
  const modelIndex = header.indexOf("model");

  const devices: CatalogDevice[] = [];

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cells = parseLine(line);
    const brand = cells[brandIndex === -1 ? 0 : brandIndex] ?? "";
    const name = cells[nameIndex === -1 ? 1 : nameIndex] ?? "";
    const codename = cells[codenameIndex === -1 ? 2 : codenameIndex] ?? "";
    const model = cells[modelIndex === -1 ? 3 : modelIndex] ?? "";
    if (!brand || !name || !codename) continue;
    devices.push({ brand, name, codename, model });
  }

  return devices;
}
