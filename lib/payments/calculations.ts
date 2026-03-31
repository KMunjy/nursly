// All monetary values in pence (integer) to avoid IEEE 754 float errors

export const PLATFORM_FEE_PERCENT = 12
export const MINIMUM_SHIFT_RATE_GBP = 12.21 // UK NMW 2025 - review annually
export const MINIMUM_SHIFT_RATE_NOTE = 'UK National Living Wage floor. Review April each year.'

export interface PaymentSplit {
  grossAmountPence: number
  platformFeePence: number
  netToNursePence: number
  totalHours: number
  ratePerHourPence: number
}

export function calculatePaymentSplit(
  ratePerHourGbp: number,
  totalHours: number
): PaymentSplit {
  const ratePerHourPence = Math.round(ratePerHourGbp * 100)
  const grossAmountPence = Math.round(ratePerHourPence * totalHours)
  // Floor fee — benefits nurse on fractional pennies
  const platformFeePence = Math.floor(grossAmountPence * PLATFORM_FEE_PERCENT / 100)
  const netToNursePence = grossAmountPence - platformFeePence

  return { grossAmountPence, platformFeePence, netToNursePence, totalHours, ratePerHourPence }
}

export function formatPenceAsCurrency(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pence / 100)
}

export function calculateTotalHours(
  clockIn: string,
  clockOut: string,
  breakMinutes: number
): number {
  const totalMinutes = (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 60000
  const workedMinutes = totalMinutes - breakMinutes
  return Math.round((workedMinutes / 60) * 100) / 100
}
