import type { UserRole } from './roles'
import { ROLE_DEFAULT_PATHS } from './roles'

export function getPostAuthRedirect(
  role: UserRole,
  onboardingComplete?: boolean
): string {
  if (role === 'nurse' && !onboardingComplete) {
    return '/nurse/onboarding'
  }
  return ROLE_DEFAULT_PATHS[role] ?? '/dashboard'
}

export function isSafeRedirect(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url, 'http://localhost')
    // Only allow same-origin paths (no external redirects)
    return parsed.origin === 'http://localhost' && url.startsWith('/')
  } catch {
    return false
  }
}
