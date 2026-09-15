import { z } from "zod";

// A device+ROM supports a set of (ROM version, Android base) pairs; either
// side may be unknown. The pair is kept so the two stay associated.
export const normalizedVersionSchema = z.object({
  romVersion: z.string().nullable(),
  androidBase: z.string().nullable(),
});

export const normalizedRomDeviceSchema = z.object({
  romId: z.string().min(1),
  romName: z.string().min(1),
  codename: z.string().min(1),
  name: z.string().nullable(),
  brand: z.string().nullable(),
  active: z.boolean(),
  maintainer: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  source: z.string().min(1),
  versions: z.array(normalizedVersionSchema).default([]),
});

export type NormalizedVersion = z.infer<typeof normalizedVersionSchema>;
export type NormalizedRomDevice = z.infer<typeof normalizedRomDeviceSchema>;
