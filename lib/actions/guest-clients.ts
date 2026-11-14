'use server'

import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { guestClientSchema, searchClientsSchema } from '@/lib/validations/guest-client'
import { normalizePhone, formatPhoneDisplay } from '@/lib/utils/phone'
import type { GuestClient } from '@/types/database'

/**
 * Search for clients (both authenticated profiles and guest clients)
 * Returns combined results from both tables
 */
export async function searchClients(query: string, limit = 10) {
  try {
    const validation = searchClientsSchema.safeParse({ query, limit })
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message || 'Invalid search query' }
    }

    const user = await getAuthUser()
    if (!user || !['staff', 'branch_manager', 'admin'].includes(user.role)) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()
    const searchTerm = validation.data.query.toLowerCase()
    
    // Check if search term looks like a phone number
    const normalizedPhone = normalizePhone(searchTerm)
    
    // Search authenticated customers (profiles with role=customer)
    let profileQuery = supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .eq('role', 'customer')
      .limit(validation.data.limit)
    
    if (normalizedPhone) {
      // Search by normalized phone
      profileQuery = profileQuery.or(`phone.ilike.%${normalizedPhone}%`)
    } else {
      // Search by name
      profileQuery = profileQuery.or(`full_name.ilike.%${searchTerm}%`)
    }
    
    const { data: profiles, error: profilesError } = await profileQuery
    
    if (profilesError) {
      console.error('[searchClients] profiles error:', profilesError)
      return { error: 'Erreur lors de la recherche' }
    }
    
    // Search guest clients
    let guestQuery = supabase
      .from('guest_clients')
      .select('id, full_name, phone, created_at')
      .limit(validation.data.limit)
    
    if (normalizedPhone) {
      guestQuery = guestQuery.eq('phone', normalizedPhone)
    } else {
      guestQuery = guestQuery.ilike('full_name', `%${searchTerm}%`)
    }
    
    const { data: guests, error: guestsError } = await guestQuery
    
    if (guestsError) {
      console.error('[searchClients] guest_clients error:', guestsError)
      // Don't fail if guest_clients table doesn't exist yet
      if (guestsError.code !== '42P01') { // 42P01 = undefined_table
        return { error: 'Erreur lors de la recherche' }
      }
    }
    
    // Combine and format results
    const combinedResults = [
      ...(profiles || []).map((p) => ({
        id: p.id,
        full_name: p.full_name || 'Sans nom',
        phone: p.phone || '',
        phone_display: p.phone ? formatPhoneDisplay(p.phone) : '',
        type: 'profile' as const,
        created_at: p.created_at,
      })),
      ...(guests || []).map((g) => ({
        id: g.id,
        full_name: g.full_name,
        phone: g.phone,
        phone_display: formatPhoneDisplay(g.phone),
        type: 'guest' as const,
        created_at: g.created_at,
      })),
    ]
    
    // Sort by most recent first
    combinedResults.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return { 
      success: true, 
      clients: combinedResults.slice(0, validation.data.limit) 
    }
  } catch (error) {
    console.error('[searchClients] unexpected error:', error)
    return { error: 'Erreur inattendue lors de la recherche' }
  }
}

/**
 * Create a new guest client (walk-in customer without auth account)
 */
export async function createGuestClient(
  input: { full_name: string; phone: string; notes?: string }
) {
  try {
    const validation = guestClientSchema.safeParse(input)
    if (!validation.success) {
      return { 
        error: validation.error.issues[0]?.message || 'Données invalides',
        field: validation.error.issues[0]?.path[0] as string,
      }
    }

    const user = await getAuthUser()
    if (!user || !['staff', 'branch_manager', 'admin'].includes(user.role)) {
      return { error: 'Non autorisé' }
    }

    const supabase = await createClient()
    const { full_name, phone } = validation.data
    
    // Check for duplicate phone in guest_clients
    const { data: existingGuest } = await supabase
      .from('guest_clients')
      .select('id, full_name, phone')
      .eq('phone', phone)
      .maybeSingle()
    
    if (existingGuest) {
      return {
        error: 'duplicate',
        existing: {
          id: existingGuest.id,
          full_name: existingGuest.full_name,
          phone: formatPhoneDisplay(existingGuest.phone),
        },
      }
    }
    
    // Check for duplicate phone in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('phone', phone)
      .eq('role', 'customer')
      .maybeSingle()
    
    if (existingProfile) {
      return {
        error: 'duplicate',
        existing: {
          id: existingProfile.id,
          full_name: existingProfile.full_name || 'Client',
          phone: formatPhoneDisplay(existingProfile.phone || phone),
        },
      }
    }
    
    // Create guest client
    const { data: newClient, error: insertError } = await supabase
      .from('guest_clients')
      .insert({
        full_name,
        phone,
        source: 'walk_in',
        created_by: user.id,
        notes: input.notes || null,
      })
      .select('id, full_name, phone, created_at')
      .single()
    
    if (insertError) {
      console.error('[createGuestClient] insert error:', insertError)
      return { error: 'Erreur lors de la création du client' }
    }
    
    return {
      success: true,
      client: {
        id: newClient.id,
        full_name: newClient.full_name,
        phone: newClient.phone,
        phone_display: formatPhoneDisplay(newClient.phone),
        type: 'guest' as const,
        created_at: newClient.created_at,
      },
    }
  } catch (error) {
    console.error('[createGuestClient] unexpected error:', error)
    return { error: 'Erreur inattendue lors de la création' }
  }
}

/**
 * Get recent clients for the dropdown (when no search query)
 */
export async function getRecentClients(limit = 10) {
  try {
    const user = await getAuthUser()
    if (!user || !['staff', 'branch_manager', 'admin'].includes(user.role)) {
      return { error: 'Unauthorized' }
    }

    const supabase = await createClient()
    
    // Get recent profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Get recent guest clients
    const { data: guests } = await supabase
      .from('guest_clients')
      .select('id, full_name, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Combine and sort
    const combined = [
      ...(profiles || []).map((p) => ({
        id: p.id,
        full_name: p.full_name || 'Sans nom',
        phone: p.phone || '',
        phone_display: p.phone ? formatPhoneDisplay(p.phone) : '',
        type: 'profile' as const,
        created_at: p.created_at,
      })),
      ...(guests || []).map((g) => ({
        id: g.id,
        full_name: g.full_name,
        phone: g.phone,
        phone_display: formatPhoneDisplay(g.phone),
        type: 'guest' as const,
        created_at: g.created_at,
      })),
    ]
    
    combined.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    return {
      success: true,
      clients: combined.slice(0, limit),
    }
  } catch (error) {
    console.error('[getRecentClients] error:', error)
    return { error: 'Erreur lors du chargement des clients récents' }
  }
}
