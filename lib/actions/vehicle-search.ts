'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  checkVehicleAvailabilitySchema, 
  searchVehiclesSchema,
  type CheckVehicleAvailabilityInput,
  type SearchVehiclesInput
} from '@/lib/validations/vehicle-search'

/**
 * Check if a vehicle is available for a given date range.
 * A vehicle is unavailable if it has overlapping confirmed/pending reservations.
 */
export async function checkVehicleAvailability(
  input: CheckVehicleAvailabilityInput
): Promise<{ available: boolean; conflictingReservations?: number }> {
  try {
    const validated = checkVehicleAvailabilitySchema.parse(input)
    const supabase = await createClient()

    // Query for overlapping reservations that are not cancelled or completed
    const { data: conflicting, error } = await supabase
      .from('reservations')
      .select('id')
      .eq('vehicle_id', validated.vehicleId)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .or(`and(start_date.lte.${validated.endDate},end_date.gte.${validated.startDate})`)

    if (error) {
      console.error('Error checking vehicle availability:', error)
      return { available: false }
    }

    const conflictCount = conflicting?.length || 0
    return {
      available: conflictCount === 0,
      conflictingReservations: conflictCount > 0 ? conflictCount : undefined,
    }
  } catch (error) {
    console.error('Error in checkVehicleAvailability:', error)
    return { available: false }
  }
}

/**
 * Search vehicles with optional availability filtering.
 * Returns vehicles matching query, optionally filtered by branch and date range.
 */
export async function searchVehicles(input: SearchVehiclesInput): Promise<{
  success: boolean
  vehicles?: Array<{
    id: string
    make: string
    model: string
    year: number
    plate_number: string
    daily_rate: number
    deposit_amount: number
    status: string
    branch_id: string
    available?: boolean
  }>
  error?: string
}> {
  try {
    const validated = searchVehiclesSchema.parse(input)
    const supabase = await createClient()

    // Build the query
    let query = supabase
      .from('vehicles')
      .select('id, make, model, year, plate_number, daily_rate, deposit_amount, status, branch_id')
      .eq('status', 'available')
      .order('make', { ascending: true })
      .order('model', { ascending: true })
      .limit(validated.limit)

    // Filter by branch if provided
    if (validated.branchId) {
      query = query.eq('branch_id', validated.branchId)
    }

    // Filter by text search if provided
    if (validated.query && validated.query.trim()) {
      const searchTerm = validated.query.trim()
      query = query.or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,plate_number.ilike.%${searchTerm}%`)
    }

    const { data: vehicles, error } = await query

    if (error) {
      console.error('Error searching vehicles:', error)
      return { success: false, error: 'Failed to search vehicles' }
    }

    if (!vehicles || vehicles.length === 0) {
      return { success: true, vehicles: [] }
    }

    // If date range is provided, check availability for each vehicle
    if (validated.startDate && validated.endDate) {
      const vehiclesWithAvailability = await Promise.all(
        vehicles.map(async (vehicle) => {
          const { available } = await checkVehicleAvailability({
            vehicleId: vehicle.id,
            startDate: validated.startDate!,
            endDate: validated.endDate!,
          })
          return { ...vehicle, available }
        })
      )
      
      return { success: true, vehicles: vehiclesWithAvailability }
    }

    return { success: true, vehicles }
  } catch (error) {
    console.error('Error in searchVehicles:', error)
    return { success: false, error: 'Failed to search vehicles' }
  }
}

/**
 * Get recently added vehicles for quick selection.
 */
export async function getRecentVehicles(branchId?: string, limit = 10): Promise<{
  success: boolean
  vehicles?: Array<{
    id: string
    make: string
    model: string
    year: number
    plate_number: string
    daily_rate: number
    deposit_amount: number
    status: string
    branch_id: string
  }>
  error?: string
}> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('vehicles')
      .select('id, make, model, year, plate_number, daily_rate, deposit_amount, status, branch_id')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data: vehicles, error } = await query

    if (error) {
      console.error('Error fetching recent vehicles:', error)
      return { success: false, error: 'Failed to fetch recent vehicles' }
    }

    return { success: true, vehicles: vehicles || [] }
  } catch (error) {
    console.error('Error in getRecentVehicles:', error)
    return { success: false, error: 'Failed to fetch recent vehicles' }
  }
}
