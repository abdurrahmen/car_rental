/**
 * Tests for phone normalization utilities
 * Run with: npx tsx lib/utils/phone.test.ts
 */

import { normalizePhone, formatPhoneDisplay, normalizeAlgerianPhone } from './phone'

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`)
  }
}

function assertNull(actual: unknown, message: string) {
  if (actual !== null) {
    throw new Error(`${message}\n  Expected: null\n  Actual: ${actual}`)
  }
}

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

// Algerian phone normalization tests
test('normalizes Algerian mobile with spaces', () => {
  assertEqual(normalizePhone('0550 12 34 56'), '+213550123456', 'spaces')
})

test('normalizes Algerian mobile without spaces', () => {
  assertEqual(normalizePhone('0550123456'), '+213550123456', 'no spaces')
})

test('normalizes Algerian mobile with +213 prefix', () => {
  assertEqual(normalizePhone('+213 550 12 34 56'), '+213550123456', '+213 prefix')
})

test('normalizes Algerian mobile with 00213 prefix', () => {
  assertEqual(normalizePhone('00213550123456'), '+213550123456', '00213 prefix')
})

test('normalizes Algerian mobile starting with 06', () => {
  assertEqual(normalizePhone('0661234567'), '+213661234567', '06 prefix')
})

test('normalizes Algerian mobile starting with 07', () => {
  assertEqual(normalizePhone('0771234567'), '+213771234567', '07 prefix')
})

test('rejects Algerian number with wrong prefix (04)', () => {
  assertNull(normalizePhone('0441234567'), 'wrong prefix 04')
})

test('rejects Algerian number too short', () => {
  assertNull(normalizePhone('055012345'), 'too short')
})

test('rejects Algerian number too long', () => {
  assertNull(normalizePhone('05501234567'), 'too long')
})

// International phone tests
test('normalizes international number', () => {
  assertEqual(normalizePhone('+33612345678'), '+33612345678', 'French mobile')
})

test('rejects international without + prefix', () => {
  assertNull(normalizePhone('33612345678'), 'no + prefix')
})

test('rejects international number too long', () => {
  assertNull(normalizePhone('+1234567890123456'), 'too long')
})

// Display formatting tests
test('formats Algerian number for display', () => {
  assertEqual(formatPhoneDisplay('+213550123456'), '05 50 12 34 56', 'Algerian display')
})

test('formats international number for display', () => {
  const formatted = formatPhoneDisplay('+33612345678')
  assertEqual(formatted, '+336 123 456 78', 'International display')
})

test('handles already formatted number', () => {
  const input = '+213550123456'
  const normalized = normalizePhone(input)
  assertEqual(normalized, input, 'already E.164')
})

// Edge cases
test('handles empty string', () => {
  assertNull(normalizePhone(''), 'empty string')
})

test('handles whitespace only', () => {
  assertNull(normalizePhone('   '), 'whitespace')
})

test('handles dashes and dots', () => {
  assertEqual(normalizePhone('0550-12-34-56'), '+213550123456', 'dashes')
  assertEqual(normalizePhone('0550.12.34.56'), '+213550123456', 'dots')
})

test('handles parentheses', () => {
  assertEqual(normalizePhone('(0550) 12 34 56'), '+213550123456', 'parentheses')
})

console.log('\n✓ All phone normalization tests passed')
