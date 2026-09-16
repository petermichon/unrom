export interface Meta {
  generatedAt: string;
  deviceCount: number;
  romCount: number;
  edgeCount: number;
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
  sourceUrl: string | null;
}

export interface DeviceDetail {
  vendor: string;
  vendorName: string;
  codename: string;
  name: string | null;
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
  sourceUrl: string | null;
}
