import { z } from "zod";

// `brand` (the marketing brand a source reports) is kept only as an internal
// signal for deriving the manufacturer/vendor; it is neither stored nor exposed.
export const normalizedRomDeviceSchema = z.object({
  romId: z.string().min(1),
  romName: z.string().min(1),
  codename: z.string().min(1),
  name: z.string().nullable(),
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
});

export type NormalizedRomDevice = z.infer<typeof normalizedRomDeviceSchema>;
