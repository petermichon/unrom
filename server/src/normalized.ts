import { z } from "zod";

export const normalizedRomDeviceSchema = z.object({
  romId: z.string().min(1),
  romName: z.string().min(1),
  codename: z.string().min(1),
  name: z.string().nullable(),
  brand: z.string().nullable(),
  romVersion: z.string().nullable(),
  androidBase: z.string().nullable(),
  active: z.boolean(),
  maintainer: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  source: z.string().min(1),
});

export type NormalizedRomDevice = z.infer<typeof normalizedRomDeviceSchema>;
