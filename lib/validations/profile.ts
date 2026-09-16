import { z } from 'zod';

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string(),
  preferred_language: z.enum(['ar', 'fr', 'en']),
  license_number: z.string().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
