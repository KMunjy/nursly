const BLOCKED_FIELDS = new Set([
  'email', 'full_name', 'name', 'first_name', 'last_name',
  'nmc_pin', 'dbs_number', 'reference_number',
  'phone', 'phone_number', 'postcode', 'location_postcode',
  'password', 'token', 'stripe_payment_intent_id',
  'stripe_transfer_id', 'rejection_reason',
])

const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  /^[0-9]{2}[A-Z][0-9]{4}[A-Z]$/i,
  /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i,
  /^0[0-9]{9,10}$/,
]

export function sanitiseAnalyticsEvent(
  eventName: string,
  properties: Record<string, unknown>
): Record<string, unknown> {
  const sanitised: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_FIELDS.has(key.toLowerCase())) continue

    if (typeof value === 'string') {
      const isPII = PII_PATTERNS.some((p) => p.test(value))
      if (isPII) {
        console.warn(`[analytics] PII detected in "${eventName}" field "${key}" — dropped`)
        continue
      }
    }

    if (key.includes('amount_pence') || key.includes('gross_amount') || key.includes('net_to_nurse')) {
      sanitised[key + '_bucket'] = bucketAmount(Number(value))
      continue
    }

    sanitised[key] = value
  }

  return sanitised
}

export function bucketAmount(pence: number): string {
  const gbp = pence / 100
  if (gbp < 50)   return '£0-49'
  if (gbp < 100)  return '£50-99'
  if (gbp < 200)  return '£100-199'
  if (gbp < 300)  return '£200-299'
  if (gbp < 500)  return '£300-499'
  if (gbp < 1000) return '£500-999'
  return '£1000+'
}
