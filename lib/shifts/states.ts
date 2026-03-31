export type ShiftStatus = 'draft' | 'open' | 'filled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type ApplicationStatus = 'pending' | 'shortlisted' | 'selected' | 'rejected' | 'withdrawn'

export const SHIFT_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  draft:       ['open', 'cancelled'],
  open:        ['filled', 'cancelled'],
  filled:      ['in_progress', 'open', 'cancelled'],
  in_progress: ['completed', 'disputed'],
  completed:   [],
  cancelled:   [],
  disputed:    ['completed', 'cancelled'],
}

export function canTransition(from: ShiftStatus, to: ShiftStatus): boolean {
  return SHIFT_TRANSITIONS[from]?.includes(to) ?? false
}

export const EMPLOYER_ALLOWED_TRANSITIONS: Partial<Record<ShiftStatus, ShiftStatus[]>> = {
  draft:  ['open', 'cancelled'],
  open:   ['cancelled'],
  filled: ['cancelled'],
}

export function employerCanTransition(from: ShiftStatus, to: ShiftStatus): boolean {
  return EMPLOYER_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending:     ['shortlisted', 'selected', 'rejected'],
  shortlisted: ['selected', 'rejected'],
  selected:    ['rejected'],
  rejected:    [],
  withdrawn:   [],
}

export const SHIFT_STATUS_LABELS: Record<ShiftStatus, string> = {
  draft:       'Draft',
  open:        'Open',
  filled:      'Filled',
  in_progress: 'In progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  disputed:    'Disputed',
}

export function isUrgent(startTime: string, status: ShiftStatus): boolean {
  if (status !== 'open') return false
  const hoursUntilStart = (new Date(startTime).getTime() - Date.now()) / 1000 / 60 / 60
  return hoursUntilStart > 0 && hoursUntilStart <= 12
}

export function shiftHours(startTime: string, endTime: string, breakMinutes: number): number {
  const totalMinutes = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60
  return Math.round(((totalMinutes - breakMinutes) / 60) * 100) / 100
}
