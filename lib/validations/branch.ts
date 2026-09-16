import { z } from 'zod';

export const branchSchema = z.object({
  name_ar: z.string().min(1),
  name_fr: z.string().min(1),
  name_en: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type BranchInput = z.infer<typeof branchSchema>;
