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
  brand: string | null;
  romCount: number;
}

export interface RomSupport {
  id: string;
  name: string;
  active: boolean;
  androidBases: string[];
  romVersions: string[];
  maintainer: string | null;
  sourceUrl: string | null;
}

export interface DeviceDetail {
  vendor: string;
  codename: string;
  name: string | null;
  brand: string | null;
  roms: RomSupport[];
}

export interface RomChip {
  id: string;
  name: string;
}

export interface BrowseDevice {
  vendor: string;
  codename: string;
  name: string | null;
  brand: string | null;
  roms: RomChip[];
}

export interface RomSummary {
  id: string;
  name: string;
  active: boolean;
  deviceCount: number;
  androidBases: string[];
  romVersions: string[];
}

export interface RomDetail extends RomSummary {
  devices: DeviceSummary[];
}

export interface Mapping {
  vendor: string;
  codename: string;
  deviceName: string | null;
  brand: string | null;
  romId: string;
  romName: string;
  active: boolean;
  androidBases: string[];
  romVersions: string[];
  maintainer: string | null;
  sourceUrl: string | null;
}
