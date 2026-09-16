import { z } from "zod";

// `brand` (the marketing brand a source reports) is kept only as an internal
// signal for deriving the manufacturer/vendor; it is neither stored nor exposed.
export const normalizedRomDeviceSchema = z.object({
  romId: z.string().min(1),
  romName: z.string().min(1),
  codename: z.string().min(1),
  name: z.string().nullable(),
  brand: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  source: z.string().min(1),
});

export type NormalizedRomDevice = z.infer<typeof normalizedRomDeviceSchema>;
