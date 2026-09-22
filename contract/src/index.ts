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
}

export interface DeviceDetail {
  vendor: string;
  vendorName: string;
  codename: string;
  name: string | null;
  aliases: string[];
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

export interface Mapping {
  vendor: string;
  vendorName: string;
  codename: string;
  deviceName: string | null;
  romId: string;
  romName: string;
  referenceUrl: string | null;
}
