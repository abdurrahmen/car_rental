import { createClient } from '@/lib/supabase/server';
import type { Vehicle, Reservation, Branch } from '@/types';
import { calculateOverviewMetrics } from '@/lib/hooks/useOverviewMetrics';

// ─── Types exported to dashboard components ───────────────────────────────

export interface PulseStats {
  handoversToday: { completed: number; total: number };
  returnsToday:   { completed: number; total: number; overdue: number };
  fleetAvailability: {
    available: number; rented: number; maintenance: number;
    retired: number;   total: number;  utilizationRate: number;
  };
  revenueMonth: { total: number; deltaPercent: number | null; sparkline: number[] };
  moneyStrip:   { collected: number; toCollectToday: number; depositsHeld: number };
  paymentSplit: { cash: number; baridimob: number; ccp: number; edahabia: number };
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
  nextEventText: { ar: string; fr: string; en: string };
  urgencyScore: number;
}

export type { RevenueDataPoint } from '@/lib/utils/revenue-series';

// ─── Vehicle select fragment ───────────────────────────────────────────────
const VEHICLE_SELECT = `
  id, branch_id, category_id, make, model, year, plate_number,
  transmission, seats, fuel_type, daily_rate, deposit_amount,
  mileage_limit_km, status, created_at, updated_at,
  branch:branches(id, name_ar, name_fr, name_en, address, city, lat, lng, phone, is_active, created_at, updated_at),
  category:vehicle_categories(id, name_ar, name_fr, name_en, description_ar, description_fr, description_en, created_at, updated_at),
  photos:vehicle_photos(id, vehicle_id, storage_path, is_primary, sort_order, created_at)
` as const;

// ─── Reservation select fragment ──────────────────────────────────────────
const RESERVATION_SELECT = `
  id, customer_id, vehicle_id, pickup_branch_id, dropoff_branch_id,
  start_date, end_date, status, total_price, deposit_amount,
  deposit_paid_at, deposit_deadline, confirmed_by, confirmed_at,
  cancelled_by, cancelled_reason, cancelled_at, notes, staff_notes,
  created_at, updated_at,
  customer:profiles(id, full_name, phone, role, branch_id, preferred_language,
    license_number, license_document_url, license_verified,
    is_blacklisted, no_show_count, created_at, updated_at)
` as const;

// ─────────────────────────────────────────────────────────────────────────────
// Main data-fetch function
// ─────────────────────────────────────────────────────────────────────────────
export async function getDashboardData(branchId?: string | null) {
  const supabase = await createClient();

  // Build queries (branch-scoped when branchId provided)
  let vehicleQuery = supabase
    .from('vehicles')
    .select(VEHICLE_SELECT)
    .eq('is_active' as never, true)         // only active vehicles
    .order('status');                        // available first

  let resQuery = supabase
    .from('reservations')
    .select(RESERVATION_SELECT)
    .order('created_at', { ascending: false });

  if (branchId) {
    vehicleQuery = vehicleQuery.eq('branch_id', branchId);
    resQuery     = resQuery.or(`pickup_branch_id.eq.${branchId},dropoff_branch_id.eq.${branchId}`);
  }

  // Execute in parallel
  const [vehicleRes, resRes, branchRes] = await Promise.all([
    vehicleQuery,
    resQuery,
    supabase.from('branches').select('id').eq('is_active', true),
  ]);

  // Log errors but don't throw — dashboard should degrade gracefully
  if (vehicleRes.error) console.error('[getDashboardData] vehicles:', vehicleRes.error.message);
  if (resRes.error)     console.error('[getDashboardData] reservations:', resRes.error.message);

  const vehicles     = (vehicleRes.data ?? []) as unknown as (Vehicle & {
    branch?:   Branch;
    category?: { name_ar: string; name_fr: string; name_en: string; description_ar: string | null; description_fr: string | null; description_en: string | null; created_at: string; updated_at: string };
    photos?:   { id: string; vehicle_id: string; storage_path: string; is_primary: boolean; sort_order: number; created_at: string }[];
  })[];

  const reservations = (resRes.data ?? []) as unknown as (Reservation & {
    customer?: { full_name?: string; phone?: string };
  })[];

  const activeBranchCount = branchRes.data?.length ?? 0;

  // Delegate all metric calculation to centralised hook (enforces invariants)
  const metrics = calculateOverviewMetrics({ vehicles, reservations, branchId });

  return {
    ...metrics,
    activeBranchCount,
  };
}
