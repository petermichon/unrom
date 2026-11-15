/**
 * Where each ROM's build dates and patch levels can be checked. Only sources
 * whose build metadata is readable without downloading an image belong here:
 * the ROM page links the newest build it claims to the feed it came from.
 */
export const BUILD_SOURCES: Record<string, string> = {
  alphadroid: "https://alphadroid.org/data/devices.json",
  crdroid: "https://github.com/crdroidandroid/android_vendor_crDroidOTA",
  grapheneos: "https://grapheneos.org/releases",
  lineageos: "https://download.lineageos.org/",
  lunaris: "https://github.com/Lunaris-AOSP/OTA/tree/16.2/builds",
};
