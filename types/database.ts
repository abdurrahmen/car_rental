// Types for the database schema
// Matches the Supabase/Postgres schema in supabase/init.sql

export type Role = 'customer' | 'staff' | 'branch_manager' | 'admin';
export type Language = 'ar' | 'fr' | 'en';
export type VehicleTransmission = 'manual' | 'automatic';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired';
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'deposit_paid'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type PaymentType = 'deposit' | 'final' | 'refund';
export type PaymentMethod = 'edahabia' | 'cib' | 'ccp' | 'baridimob' | 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DocumentType = 'license' | 'national_id' | 'passport';
export type FuelLevel = 'empty' | 'quarter' | 'half' | 'three_quarter' | 'full';
export type ConditionStage = 'pickup' | 'return';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  branch_id: string | null;
  preferred_language: Language;
  license_number: string | null;
  license_document_url: string | null;
  license_verified: boolean;
  is_blacklisted: boolean;
  no_show_count: number;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleCategory {
  id: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  description_ar: string | null;
  description_fr: string | null;
  description_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  branch_id: string;
  category_id: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  transmission: VehicleTransmission;
  seats: number;
  fuel_type: FuelType;
  daily_rate: number;
  deposit_amount: number;
  mileage_limit_km: number | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
  // Joined relations
  branch?: Branch;
  category?: VehicleCategory;
  photos?: VehiclePhoto[];
}

export interface VehiclePhoto {
  id: string;
  vehicle_id: string;
  storage_path: string;
  photo_url?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Reservation {
  id: string;
  customer_id: string;
  vehicle_id: string;
  pickup_branch_id: string;
  dropoff_branch_id: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  total_price: number;
  deposit_amount: number;
  deposit_paid_at: string | null;
  deposit_deadline: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  cancelled_by: string | null;
  cancelled_reason: string | null;
  cancelled_at: string | null;
  notes: string | null;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  vehicle?: Vehicle;
  customer?: Profile;
  pickup_branch?: Branch;
  dropoff_branch?: Branch;
}

export interface Payment {
  id: string;
  reservation_id: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuestClient {
  id: string;
  full_name: string;
  phone: string;
  source: 'walk_in' | 'phone' | 'online';
  created_by: string;
  created_at: string;
  notes: string | null;
}

export interface VehicleConditionReport {
  id: string;
  reservation_id: string;
  stage: ConditionStage;
  odometer_reading: number;
  fuel_level: FuelLevel;
  photos: string[];
  notes: string | null;
  damage_noted: boolean;
  staff_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  profile_id: string;
  type: DocumentType;
  storage_path: string;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reservation_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title_ar: string;
  title_fr: string;
  title_en: string;
  message_ar: string;
  message_fr: string;
  message_en: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
