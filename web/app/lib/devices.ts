import type { BrowseDevice } from "@/lib/types";

export function deviceName(device: BrowseDevice): string {
  return device.name ?? device.codename;
}
