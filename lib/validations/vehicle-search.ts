import { z } from 'zod'

export const checkVehicleAvailabilitySchema = z.object({
  vehicleId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const searchVehiclesSchema = z.object({
  query: z.string().optional(),
  branchId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.number().int().min(1).max(50).default(20),
})

export type CheckVehicleAvailabilityInput = z.infer<typeof checkVehicleAvailabilitySchema>
export type SearchVehiclesInput = z.infer<typeof searchVehiclesSchema>
