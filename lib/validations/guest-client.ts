import { z } from 'zod'
import { normalizePhone } from '@/lib/utils/phone'

/**
 * Validation schema for creating a guest client (walk-in customer without account)
 */
export const guestClientSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long')
    .regex(
      /^[\p{L}\p{M}\s'-]+$/u,
      'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
    ),
  phone: z
    .string()
    .trim()
    .min(1, 'Le numéro de téléphone est requis')
    .transform((val) => normalizePhone(val))
    .refine((val) => val !== null, {
      message: 'Numéro de téléphone invalide. Format attendu : 05 XX XX XX XX ou +XXX...',
    })
    .transform((val) => val as string), // Type assertion after refine
})

export type GuestClientInput = z.input<typeof guestClientSchema>
export type GuestClientData = z.output<typeof guestClientSchema>

/**
 * Validation schema for searching clients
 */
export const searchClientsSchema = z.object({
  query: z.string().trim().min(1, 'La recherche ne peut pas être vide').max(100),
  limit: z.number().int().positive().max(50).optional().default(10),
})

export type SearchClientsInput = z.infer<typeof searchClientsSchema>
