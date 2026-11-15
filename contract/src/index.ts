export interface Meta {
  generatedAt: string;
  contentHash: string;
}

/** Which property filter a browse row satisfied, and the facts behind it. */
export type DeviceFilterKind = "relock" | "updated" | "hardened";

export interface DeviceMatchSource {
  /** The fact the link checks, e.g. `relock`, `patches`, `builds`. */
  label: string;
  url: string;
}

export interface DeviceMatch {
  filter: DeviceFilterKind;
  romId: string;
  romName: string;
  /** The facts that qualified the pair, in the source's terms. */
  facts: string[];
  /** Empty when the fact has no single page to check. */
  sources: DeviceMatchSource[];
}

export interface DeviceSummary {
  vendor: string;
  codename: string;
  name: string | null;
  romCount: number;
}

/**
 * How a citation was obtained. `observed` means the source itself named the
 * URL; `derived` means it was built from the codename and is not evidence of
 * the page existing.
 */
export type ReferenceKind = "observed" | "derived";

/**
 * What the newest published build for a device reports. Both dates are
 * `YYYY-MM-DD`; `null` means the source does not publish that fact, never that
 * it is missing upstream.
 */
export interface BuildInfo {
  /** Date of the newest build the source lists for this device. */
  date: string | null;
  /** Security patch level that build reports. */
  securityPatch: string | null;
}

/**
 * Whether the bootloader can be locked again after this ROM is installed, in
 * the project's own words. `scope` says whether the statement is about this
 * device (`device`) or about every device the ROM supports (`rom`).
 */
export interface RelockInfo {
  status: "supported" | "unsupported" | "unknown";
  /** The source's wording, so the claim is not collapsed into a boolean. */
  summary: string;
  sourceUrl: string;
  verifiedAt: string;
  scope: "rom" | "device";
}

export interface RomSupport {
  id: string;
  name: string;
  referenceUrl: string | null;
  referenceKind: ReferenceKind;
  /** Set when the ROM supports this device via a covering build target. */
  inheritedFrom: string | null;
  /** Null when the source publishes no build metadata for this device. */
  build: BuildInfo | null;
  /** Null when no project statement covers this ROM on this device. */
  relock: RelockInfo | null;
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

/** A vendor's official position on unlocking its devices' bootloaders. */
export type BootloaderPolicyStatus =
  "supported" | "conditional" | "unsupported" | "unknown";

/** How much of a vendor's current lineup a policy is meant to cover. */
export type BootloaderPolicyScope = "all" | "most" | "some" | "unknown";

/**
 * Vendor-level only. A device can still differ by carrier, region, model
 * variant, or firmware; the conditions carry those caveats.
 */
export interface BootloaderPolicy {
  vendor: string;
  vendorName: string;
  status: BootloaderPolicyStatus;
  scope: BootloaderPolicyScope;
  summary: string;
  conditions: string[];
  sourceUrl: string;
  /** Date the vendor source was last checked, ISO `YYYY-MM-DD`. */
  verifiedAt: string;
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
  /** Why this row matched the active property filter; empty otherwise. */
  match: DeviceMatch[];
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
  /**
   * Uppercase letter, `#` for names starting with a digit, or `other` for
   * non-Latin and punctuation names.
   */
  letter: string;
  deviceCount: number;
  /** Devices with at least one ROM build, directly or via a covered variant. */
  withRoms: number;
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
  /** A static description of the project; null when none is curated. */
  tagline: string | null;
  devices: DeviceSummary[];
  /** Null when no device of this ROM reports build metadata. */
  build: RomBuildSummary | null;
}

/** How current this ROM's builds are, across the devices it supports. */
export interface RomBuildSummary {
  /** Newest build date any of its devices reports, `YYYY-MM-DD`. */
  newest: string;
  /** How many of its devices report a build date, out of `deviceCount`. */
  devicesWithBuild: number;
  /** Where the claim can be checked; null when the ROM publishes no feed. */
  sourceUrl: string | null;
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
  referenceKind: ReferenceKind;
  reportedCodename: string | null;
  /** Null when the source publishes no build metadata for this device. */
  build: BuildInfo | null;
  /** Null when no project statement covers this ROM on this device. */
  relock: RelockInfo | null;
}
