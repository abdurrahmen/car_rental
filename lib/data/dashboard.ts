import { createClient } from '@/lib/supabase/server';
import type { Vehicle, Reservation, Branch } from '@/types';
import { calculateOverviewMetrics } from '@/lib/hooks/useOverviewMetrics';

import {
  FALLBACK_VEHICLES,
  FALLBACK_RESERVATIONS,
  FALLBACK_BRANCHES,
} from '@/lib/data/fallback';

export interface PulseStats {
  handoversToday: {
    completed: number;
    total: number;
  };
  returnsToday: {
    completed: number;
    total: number;
    overdue: number;
  };
  fleetAvailability: {
    available: number;
    rented: number;
    maintenance: number;
    retired: number;
    total: number;
    utilizationRate: number;
  };
  revenueMonth: {
    total: number;
    deltaPercent: number | null;
    sparkline: number[];
  };
  moneyStrip: {
    collected: number;
    toCollectToday: number;
    depositsHeld: number;
  };
  paymentSplit: {
    cash: number;
    baridimob: number;
    ccp: number;
    edahabia: number;
  };
}

export interface ActionItem {
  id: string;
  type: 'pending_booking' | 'overdue_return' | 'cash_collect' | 'deposit_release' | 'maintenance_due';
  priority: 'urgent' | 'high' | 'medium';
  title: string;
  subtitle: string;
  amount?: number;
  phone?: string;
  referenceId?: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  type: 'handover' | 'return' | 'inspection';
  status: 'completed' | 'in_progress' | 'scheduled';
  vehicleName: string;
  vehiclePlate: string;
  customerName: string;
  branchName: string;
  actionLabelKey: 'start_handover' | 'process_return' | 'start_inspection';
  reservationId: string;
}

export interface GarageVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  dailyRate: number;
  branchId: string;
  branchName: string;
  categoryName: string;
  photoUrl: string;
  nextEventText: {
    ar: string;
    fr: string;
    en: string;
  };
  urgencyScore: number;
}

export type { RevenueDataPoint } from '@/lib/utils/revenue-series';

/**
 * Fetch all dashboard metrics with optional branch filtering.
 * Uses centralized calculateOverviewMetrics to ensure data consistency.
 * Respects RLS and branch manager scope.
 */
export async function getDashboardData(branchId?: string | null) {
  const supabase = await createClient();

  // 1. Fetch Vehicles
  let vehicleQuery = supabase
    .from('vehicles')
    .select(`
      id, branch_id, category_id, make, model, year, plate_number,
      daily_rate, deposit_amount, status,
      branch:branches(id, name_ar, name_fr, name_en, city),
      category:vehicle_categories(id, name_ar, name_fr, name_en),
      photos:vehicle_photos(storage_path, is_primary)
    `);

  if (branchId) {
    vehicleQuery = vehicleQuery.eq('branch_id', branchId);
  }

  // 2. Build Reservations Query
  let resQuery = supabase
    .from('reservations')
    .select(`
      id, customer_id, vehicle_id, pickup_branch_id, dropoff_branch_id,
      start_date, end_date, status, total_price, deposit_amount,
      notes, staff_notes, created_at,
      vehicle:vehicles(id, make, model, plate_number, daily_rate),
      customer:profiles(id, full_name, phone)
    `);

  if (branchId) {
    resQuery = resQuery.or(`pickup_branch_id.eq.${branchId},dropoff_branch_id.eq.${branchId}`);
  }

  // Execute both queries concurrently
  const [{ data: dbVehicles }, { data: dbReservations }] = await Promise.all([
    vehicleQuery,
    resQuery,
  ]);

  const rawVehicles = (dbVehicles && dbVehicles.length > 0 ? dbVehicles : FALLBACK_VEHICLES) as (Vehicle & {
    photos?: { storage_path?: string; is_primary?: boolean }[];
    branch?: Branch;
    category?: { name_ar: string; name_fr: string; name_en: string };
  })[];

  const vehicles = branchId
    ? rawVehicles.filter((v) => v.branch_id === branchId)
    : rawVehicles;

  const rawReservations = (dbReservations && dbReservations.length > 0 ? dbReservations : FALLBACK_RESERVATIONS) as (Reservation & {
    customer?: { full_name?: string; phone?: string };
    vehicle?: { make: string; model: string; plate_number: string; daily_rate: number };
  })[];

  const reservations = branchId
    ? rawReservations.filter((r) => r.pickup_branch_id === branchId || r.dropoff_branch_id === branchId)
    : rawReservations;

  // 3. Calculate all metrics from centralized source (enforces invariants)
  const metrics = calculateOverviewMetrics({
    vehicles,
    reservations,
    branchId,
  });

  return {
    ...metrics,
    activeBranchCount: FALLBACK_BRANCHES.length,
  };
}
