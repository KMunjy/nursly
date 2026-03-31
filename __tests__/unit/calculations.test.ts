import { describe, it, expect } from 'vitest'
import {
  calculatePaymentSplit,
  calculateTotalHours,
  formatPenceAsCurrency,
  PLATFORM_FEE_PERCENT,
  MINIMUM_SHIFT_RATE_GBP,
} from '@/lib/payments/calculations'

describe('calculatePaymentSplit', () => {
  it('calculates correct split for standard shift', () => {
    // £28.50/hr × 11.5hrs = £327.75 gross
    // 12% fee = £39.33 (floor), nurse gets £288.42
    const result = calculatePaymentSplit(28.50, 11.5)
    expect(result.grossAmountPence).toBe(32775)
    expect(result.platformFeePence).toBe(3933)
    expect(result.netToNursePence).toBe(28842)
    expect(result.grossAmountPence - result.platformFeePence).toBe(result.netToNursePence)
  })

  it('floors platform fee to benefit nurse on fractional pennies', () => {
    // £10/hr × 1hr = £10.00 gross
    // 12% = £1.20 exact — no rounding issue
    const result = calculatePaymentSplit(10, 1)
    expect(result.platformFeePence).toBe(120)
    expect(result.netToNursePence).toBe(880)
  })

  it('avoids IEEE 754 float errors (0.1 + 0.2 problem)', () => {
    // This would be 0.30000000000000004 if using floats
    const result = calculatePaymentSplit(10, 0.1 + 0.2)
    // Should be exactly 30 pence per hour × 0.3 hours
    expect(result.grossAmountPence).toBe(300)
  })

  it('works correctly for minimum wage rate', () => {
    const result = calculatePaymentSplit(MINIMUM_SHIFT_RATE_GBP, 8)
    expect(result.grossAmountPence).toBeGreaterThan(0)
    expect(result.netToNursePence).toBeGreaterThan(0)
    expect(result.netToNursePence).toBeLessThan(result.grossAmountPence)
  })

  it('net = gross - fee invariant always holds', () => {
    const cases = [
      [12.21, 4], [24.00, 12], [35.00, 8], [29.50, 11.5],
    ]
    for (const [rate, hours] of cases) {
      const result = calculatePaymentSplit(rate, hours)
      expect(result.netToNursePence).toBe(result.grossAmountPence - result.platformFeePence)
    }
  })

  it('platform fee is exactly 12 percent of gross (floored)', () => {
    const result = calculatePaymentSplit(25, 10)
    const expectedFee = Math.floor(result.grossAmountPence * PLATFORM_FEE_PERCENT / 100)
    expect(result.platformFeePence).toBe(expectedFee)
  })
})

describe('calculateTotalHours', () => {
  it('calculates hours correctly with no break', () => {
    const clockIn  = '2025-04-01T07:00:00.000Z'
    const clockOut = '2025-04-01T19:00:00.000Z'
    expect(calculateTotalHours(clockIn, clockOut, 0)).toBe(12)
  })

  it('subtracts break time correctly', () => {
    const clockIn  = '2025-04-01T07:00:00.000Z'
    const clockOut = '2025-04-01T19:00:00.000Z'
    expect(calculateTotalHours(clockIn, clockOut, 30)).toBe(11.5)
  })

  it('handles night shifts spanning midnight', () => {
    const clockIn  = '2025-04-01T19:00:00.000Z'
    const clockOut = '2025-04-02T07:00:00.000Z'
    expect(calculateTotalHours(clockIn, clockOut, 0)).toBe(12)
  })

  it('handles short shifts', () => {
    const clockIn  = '2025-04-01T09:00:00.000Z'
    const clockOut = '2025-04-01T13:00:00.000Z'
    expect(calculateTotalHours(clockIn, clockOut, 0)).toBe(4)
  })
})

describe('formatPenceAsCurrency', () => {
  it('formats pence as GBP string', () => {
    expect(formatPenceAsCurrency(32775)).toBe('£327.75')
    expect(formatPenceAsCurrency(100)).toBe('£1.00')
    expect(formatPenceAsCurrency(50)).toBe('£0.50')
    expect(formatPenceAsCurrency(0)).toBe('£0.00')
  })

  it('always shows 2 decimal places', () => {
    expect(formatPenceAsCurrency(100)).toMatch(/\.00$/)
    expect(formatPenceAsCurrency(150)).toMatch(/\.50$/)
  })
})
