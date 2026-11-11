import { z } from 'zod';

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 2),
  plate_number: z.string().min(1, 'License plate is required'),
  transmission: z.enum(['manual', 'automatic']),
  seats: z.coerce.number().min(1).max(50),
  fuel_type: z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
  daily_rate: z.coerce.number().positive('Daily rate must be positive'),
  deposit_amount: z.coerce.number().positive().default(5000),
  mileage_limit_km: z.coerce.number().optional().nullable(),
  branch_id: z.string().min(1, 'Please select a branch'),
  category_id: z.string().min(1, 'Please select a category'),
});

export const vehicleStatusSchema = z.object({
  id: z.string().optional().or(z.literal('')),
  status: z.enum(['available', 'rented', 'maintenance', 'retired']),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleStatusInput = z.infer<typeof vehicleStatusSchema>;
