/**
 * Phone number normalization utilities for Algerian and international numbers
 * Stores in E.164 format, displays in local format
 */

/**
 * Normalize Algerian phone number to E.164 format (+213XXXXXXXXX)
 * Accepts: 0550123456, +213 550 12 34 56, 00213550123456, etc.
 */
export function normalizeAlgerianPhone(input: string): string | null {
  // Remove all non-digit characters except leading +
  const cleaned = input.replace(/[^\d+]/g, '')
  
  // Handle different formats
  let digits = cleaned
  
  // Remove leading + if present
  if (digits.startsWith('+')) {
    digits = digits.slice(1)
  }
  
  // Remove leading 00 if present (international format)
  if (digits.startsWith('00')) {
    digits = digits.slice(2)
  }
  
  // If already has 213 prefix
  if (digits.startsWith('213')) {
    const number = digits.slice(3)
    // Algerian mobile: must be 05/06/07 followed by 8 digits
    if (number.length === 9 && /^0[567]\d{8}$/.test('0' + number)) {
      return `+213${number}`
    }
    return null
  }
  
  // If starts with 0 (local format)
  if (digits.startsWith('0')) {
    // Must be 10 digits total, starting with 05/06/07
    if (digits.length === 10 && /^0[567]\d{8}$/.test(digits)) {
      return `+213${digits.slice(1)}`
    }
    return null
  }
  
  // If 9 digits starting with 5/6/7 (without leading 0)
  if (digits.length === 9 && /^[567]\d{8}$/.test(digits)) {
    return `+213${digits}`
  }
  
  return null
}

/**
 * Normalize international phone number to E.164 format
 * For non-Algerian numbers, apply basic E.164 rules
 */
export function normalizeInternationalPhone(input: string): string | null {
  const cleaned = input.replace(/[^\d+]/g, '')
  
  // Must start with +
  if (!cleaned.startsWith('+')) {
    return null
  }
  
  // Remove + for validation
  const digits = cleaned.slice(1)
  
  // E.164: 1-15 digits, country code 1-3 digits
  if (digits.length < 7 || digits.length > 15) {
    return null
  }
  
  // Must be all digits
  if (!/^\d+$/.test(digits)) {
    return null
  }
  
  return `+${digits}`
}

/**
 * Normalize any phone number (Algerian or international)
 * Returns E.164 format or null if invalid
 */
export function normalizePhone(input: string): string | null {
  if (!input || input.trim().length === 0) {
    return null
  }
  
  const trimmed = input.trim()
  
  // Try Algerian format first
  const algerian = normalizeAlgerianPhone(trimmed)
  if (algerian) {
    return algerian
  }
  
  // Try international format
  if (trimmed.includes('+')) {
    return normalizeInternationalPhone(trimmed)
  }
  
  return null
}

/**
 * Format phone number for display
 * E.164 +213550123456 → 05 50 12 34 56
 * Other international → +XX XXX XXX XXX
 */
export function formatPhoneDisplay(e164: string): string {
  if (!e164 || !e164.startsWith('+')) {
    return e164
  }
  
  // Algerian number
  if (e164.startsWith('+213')) {
    const local = e164.slice(4) // Remove +213
    if (local.length === 9) {
      // Format as 0X XX XX XX XX
      return `0${local[0]} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`
    }
  }
  
  // Generic international formatting
  const digits = e164.slice(1)
  const parts: string[] = []
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, i + 3))
  }
  return '+' + parts.join(' ')
}

/**
 * Validate that a string is a valid phone format (before normalization)
 */
export function isValidPhoneInput(input: string): boolean {
  return normalizePhone(input) !== null
}
