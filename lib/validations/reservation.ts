import { z } from 'zod';

export const reservationRequestSchema = z
  .object({
    vehicle_id: z.string().min(1, 'Vehicle is required'),
    pickup_branch_id: z.string().min(1, 'Pickup branch is required'),
    dropoff_branch_id: z.string().min(1, 'Dropoff branch is required'),
    start_date: z.string().min(1),
    end_date: z.string().min(1),
    notes: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.end_date) > new Date(data.start_date),
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    },
  );

export const reservationActionSchema = z.object({
  reservation_id: z.string().min(1, 'Reservation ID is required'),
  staff_notes: z.string().optional(),
});

export const cancelReservationSchema = z.object({
  reservation_id: z.string().min(1, 'Reservation ID is required'),
  reason: z.string().optional(),
});

export const conditionReportSchema = z.object({
  reservation_id: z.string().min(1, 'Reservation ID is required'),
  stage: z.enum(['pickup', 'return']),
  odometer_reading: z.coerce.number().min(0),
  fuel_level: z.enum(['empty', 'quarter', 'half', 'three_quarter', 'full']),
  notes: z.string().optional(),
  damage_noted: z.coerce.boolean().default(false),
});

export type ReservationRequestInput = z.infer<typeof reservationRequestSchema>;
export type ReservationActionInput = z.infer<typeof reservationActionSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
export type ConditionReportInput = z.infer<typeof conditionReportSchema>;
