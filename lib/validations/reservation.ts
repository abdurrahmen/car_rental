import { z } from 'zod';

export const reservationRequestSchema = z
  .object({
    vehicle_id: z.string().uuid(),
    pickup_branch_id: z.string().uuid(),
    dropoff_branch_id: z.string().uuid(),
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
  reservation_id: z.string().uuid(),
  staff_notes: z.string().optional(),
});

export const cancelReservationSchema = z.object({
  reservation_id: z.string().uuid(),
  reason: z.string().optional(),
});

export type ReservationRequestInput = z.infer<typeof reservationRequestSchema>;
export type ReservationActionInput = z.infer<typeof reservationActionSchema>;
export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
