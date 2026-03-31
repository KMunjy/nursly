import { describe, it, expect } from 'vitest'
import {
  canTransition,
  employerCanTransition,
  isUrgent,
  shiftHours,
  SHIFT_TRANSITIONS,
} from '@/lib/shifts/states'
import type { ShiftStatus } from '@/lib/shifts/states'

describe('canTransition', () => {
  it('allows valid transitions', () => {
    expect(canTransition('draft', 'open')).toBe(true)
    expect(canTransition('open', 'filled')).toBe(true)
    expect(canTransition('filled', 'in_progress')).toBe(true)
    expect(canTransition('in_progress', 'completed')).toBe(true)
    expect(canTransition('in_progress', 'disputed')).toBe(true)
  })

  it('blocks invalid transitions', () => {
    expect(canTransition('completed', 'open')).toBe(false)
    expect(canTransition('cancelled', 'open')).toBe(false)
    expect(canTransition('draft', 'completed')).toBe(false)
    expect(canTransition('open', 'in_progress')).toBe(false)
  })

  it('completed and cancelled are terminal states', () => {
    expect(SHIFT_TRANSITIONS['completed']).toHaveLength(0)
    expect(SHIFT_TRANSITIONS['cancelled']).toHaveLength(0)
  })
})

describe('employerCanTransition', () => {
  it('allows employer to publish draft', () => {
    expect(employerCanTransition('draft', 'open')).toBe(true)
  })

  it('allows employer to cancel open or filled shifts', () => {
    expect(employerCanTransition('open', 'cancelled')).toBe(true)
    expect(employerCanTransition('filled', 'cancelled')).toBe(true)
  })

  it('blocks employer from completing or marking in_progress', () => {
    expect(employerCanTransition('in_progress', 'completed')).toBe(false)
    expect(employerCanTransition('filled', 'in_progress')).toBe(false)
  })

  it('blocks employer from resolving disputes', () => {
    expect(employerCanTransition('disputed', 'completed')).toBe(false)
  })
})

describe('isUrgent', () => {
  it('marks open shift starting in < 12 hours as urgent', () => {
    const soon = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    expect(isUrgent(soon, 'open')).toBe(true)
  })

  it('does not mark non-open shift as urgent', () => {
    const soon = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    expect(isUrgent(soon, 'filled')).toBe(false)
    expect(isUrgent(soon, 'cancelled')).toBe(false)
  })

  it('does not mark shift starting in > 12 hours as urgent', () => {
    const later = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(isUrgent(later, 'open')).toBe(false)
  })

  it('does not mark past shifts as urgent', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(isUrgent(past, 'open')).toBe(false)
  })
})

describe('shiftHours', () => {
  it('calculates 12-hour shift correctly', () => {
    const start = '2025-04-01T07:00:00.000Z'
    const end   = '2025-04-01T19:00:00.000Z'
    expect(shiftHours(start, end, 0)).toBe(12)
    expect(shiftHours(start, end, 30)).toBe(11.5)
    expect(shiftHours(start, end, 60)).toBe(11)
  })
})
