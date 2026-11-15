import { z } from "zod";

// `brand` (the marketing brand a source reports) is kept only as an internal
// signal for deriving the manufacturer/vendor; it is neither stored nor exposed.
export const normalizedRomDeviceSchema = z.object({
  romId: z.string().min(1),
  romName: z.string().min(1),
  codename: z.string().min(1),
  name: z.string().nullable(),
  // Every model name the source reports for this codename. Rosters that list
  // hardware variants (e.g. LineageOS `variant: 1|2`) name one model per
  // variant; collapsing them loses facts, so keep them all.
  names: z.array(z.string()).default([]),
  brand: z.string().nullable(),
  referenceUrl: z.string().nullable(),
  // How the citation was obtained. `observed` means the source itself named the
  // URL; `derived` means the pipeline built it from the codename, so it must be
  // verified before it is published.
  referenceKind: z.enum(["observed", "derived"]).default("observed"),
  // The codename the source's entry is keyed by, when it differs from
  // `codename` (e.g. a combined `sweet/sweetin` entry). Proves which variant
  // covers which.
  reportedCodename: z.string().nullable().default(null),
  // A source can list a device before it ships a build for it (PixelOS keeps
  // the entry `active` with an empty `download_link`). The entry still proves
  // the source names the device, so it stays in the snapshot, but it is not
  // support: no build edge is published for it.
  hasBuild: z.boolean().default(true),
  // What the newest build the source lists reports. `YYYY-MM-DD`; null when the
  // source does not publish the fact.
  buildDate: z.string().nullable().default(null),
  securityPatch: z.string().nullable().default(null),
});

export type NormalizedRomDevice = z.infer<typeof normalizedRomDeviceSchema>;
