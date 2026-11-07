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
  /** Every canonical model name for this codename. */
  names: string[];
  aliases: string[];
  /** Every codename a single build is valid for, including this one. */
  group: string[];
  roms: RomSupport[];
  /** How well source data backs the curated names; null when uncurated. */
  confidence: RegistryConfidence | null;
  /** ROM ids whose reported names match the curated names. */
  sources: string[];
}

/** A curated `(vendor, codename)` → model name mapping. */
export type RegistryConfidence =
  "verified" | "inferred" | "manual" | "unverified";

export interface RegistryEntry {
  vendor: string;
  vendorName: string;
  codename: string;
  name: string | null;
  /** Every curated model name for this codename. */
  names: string[];
  /** Whether the device appears in the current ROM coverage data. */
  supported: boolean;
  /** How well source data backs the curated names. */
  confidence: RegistryConfidence;
  /** ROM ids whose reported names match the curated names. */
  sources: string[];
}

export interface RomChip {
  id: string;
  name: string;
}

/** Whether the project still ships builds. */
export type RomStatus = "active" | "discontinued" | "unknown";

export interface BrowseDevice {
  vendor: string;
  vendorName: string;
  codename: string;
  name: string | null;
  /** Every canonical model name for this codename. */
  names: string[];
  aliases: string[];
  /** Every codename one build is valid for, including this one. */
  group: string[];
  roms: RomChip[];
  /** How well source data backs the curated names; null when uncurated. */
  confidence: RegistryConfidence | null;
}

export interface RomSummary {
  id: string;
  name: string;
  status: RomStatus;
  deviceCount: number;
}

/** Counts and top devices for the home page, without the full catalogue. */
export interface Summary {
  deviceCount: number;
  brandCount: number;
  romCount: number;
  /** ROMs with at least one device build. */
  coveredRomCount: number;
  /** Highest ROM-count devices, already sorted. */
  topDevices: BrowseDevice[];
}

export interface BrandSummary {
  vendor: string;
  vendorName: string;
  deviceCount: number;
  /** Devices with at least one ROM build, directly or via a covered variant. */
  withRoms: number;
}

/** Grouped, capped results for the home and command-palette searches. */
export interface LetterSummary {
  /** Uppercase letter, or `#` for names starting with a digit. */
  letter: string;
  deviceCount: number;
}

export interface SearchResponse {
  devices: BrowseDevice[];
  brands: BrandSummary[];
  roms: RomSummary[];
  totals: {
    devices: number;
    brands: number;
    roms: number;
  };
}

export interface RomDetail extends RomSummary {
  devices: DeviceSummary[];
}

export interface DeviceVariant {
  vendor: string;
  codename: string;
  variantCodename: string;
  source: string;
  evidence: string;
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
