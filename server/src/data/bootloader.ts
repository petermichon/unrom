import type {
  BootloaderPolicy,
  BootloaderPolicyScope,
  BootloaderPolicyStatus,
} from "@unrom/contract";

import { vendorName } from "./identity.ts";

interface PolicySeed {
  vendor: string;
  status: BootloaderPolicyStatus;
  scope: BootloaderPolicyScope;
  summary: string;
  conditions: string[];
  sourceUrl: string;
  verifiedAt: string;
}

// Vendor-level policies only. A row says what the vendor publishes, not what a
// particular carrier, region, variant or firmware build allows.
const POLICY_SEEDS: PolicySeed[] = [
  {
    vendor: "fairphone",
    status: "supported",
    scope: "all",
    summary:
      "Fairphone publishes an official unlock process for every model except the Fairphone 2.",
    conditions: [
      "All models except the Fairphone 2.",
      "The phone must be online when OEM unlocking is enabled.",
    ],
    sourceUrl:
      "https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader",
    verifiedAt: "2026-11-14",
  },
  {
    vendor: "google",
    status: "conditional",
    scope: "most",
    summary:
      "Pixel devices use the standard Android OEM-unlocking process; carrier-locked models can behave differently.",
    conditions: [
      "OEM unlocking must be available in Developer options.",
      "Carrier-locked models can differ from devices bought directly from Google.",
    ],
    sourceUrl: "https://support.google.com/pixelphone/answer/6172890",
    verifiedAt: "2026-11-14",
  },
  {
    vendor: "motorola",
    status: "conditional",
    scope: "most",
    summary:
      "Motorola's Bootloader Unlock program covers most recent devices, with carrier exclusions.",
    conditions: [
      "Use Motorola's Device ID check to confirm eligibility.",
      "Carrier-exclusive models such as Verizon, AT&T and Tracfone can be excluded.",
    ],
    sourceUrl:
      "https://en-us.support.motorola.com/app/answers/detail/a_id/87215",
    verifiedAt: "2026-11-14",
  },
  {
    vendor: "oneplus",
    status: "conditional",
    scope: "most",
    summary:
      "OnePlus supports official unlocking on most global devices, but carrier and regional variants can require a token or a separate programme.",
    conditions: [
      "Global models normally use the standard fastboot process.",
      "T-Mobile models require an unlock token; some China models use a separate programme.",
    ],
    sourceUrl: "https://oneplus.com/us/unlock_token",
    verifiedAt: "2026-11-14",
  },
  {
    vendor: "sony",
    status: "conditional",
    scope: "some",
    summary:
      "Sony operates an official unlock service for Xperia devices; carrier and regional variants can be ineligible.",
    conditions: [
      "Only Xperia models are covered.",
      "Check the service menu for “Bootloader unlock allowed”; carrier and Japanese variants can differ.",
    ],
    sourceUrl:
      "https://developer.sony.com/open-source/aosp-on-xperia-open-devices/get-started/unlock-bootloader",
    verifiedAt: "2026-11-14",
  },
  {
    vendor: "xiaomi",
    status: "conditional",
    scope: "most",
    summary:
      "Xiaomi operates an official Mi Unlock process with account, region and waiting-period requirements.",
    conditions: [
      "A Mi account and network/SIM setup are required.",
      "Waiting periods and annual device quotas apply.",
      "Regional policy can differ.",
    ],
    sourceUrl: "https://mi.com/global/support/faq/details/KA-07238",
    verifiedAt: "2026-11-14",
  },
];

export const BOOTLOADER_POLICIES: readonly BootloaderPolicy[] =
  POLICY_SEEDS.map((seed) => ({
    ...seed,
    vendorName: vendorName(seed.vendor),
  })).sort((a, b) => a.vendorName.localeCompare(b.vendorName));

const POLICY_BY_VENDOR = new Map(
  BOOTLOADER_POLICIES.map((policy) => [policy.vendor, policy]),
);

export function listBootloaderPolicies(): BootloaderPolicy[] {
  return [...BOOTLOADER_POLICIES];
}

export function getBootloaderPolicy(vendor: string): BootloaderPolicy | null {
  return POLICY_BY_VENDOR.get(vendor.toLowerCase()) ?? null;
}
