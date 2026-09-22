export interface Meta {
  generatedAt: string;
  contentHash: string;
}

export interface DeviceSummary {
  vendor: string;
  codename: string;
  name: string | null;
  romCount: number;
}

export interface RomSupport {
  id: string;
  name: string;
  referenceUrl: string | null;
  /** Set when the ROM supports this device via a covering build target. */
  inheritedFrom: string | null;
}

export interface DeviceDetail {
  vendor: string;
  vendorName: string;
  codename: string;
  name: string | null;
  aliases: string[];
  /** The main codename whose builds cover this device, if it is a variant. */
  variantOf: string | null;
  /** Codename variants this device's builds cover. */
  variants: string[];
  roms: RomSupport[];
}

export interface RomChip {
  id: string;
  name: string;
}

export interface BrowseDevice {
  vendor: string;
  vendorName: string;
  codename: string;
  name: string | null;
  aliases: string[];
  roms: RomChip[];
}

export interface RomSummary {
  id: string;
  name: string;
  deviceCount: number;
}

export interface RomDetail extends RomSummary {
  devices: DeviceSummary[];
}

export interface DeviceVariant {
  vendor: string;
  codename: string;
  variantCodename: string;
  source: string;
}

export interface Mapping {
  vendor: string;
  vendorName: string;
  codename: string;
  deviceName: string | null;
  romId: string;
  romName: string;
  referenceUrl: string | null;
  reportedCodename: string | null;
}
