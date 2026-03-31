export const ROLES = {
  NURSE: 'nurse',
  EMPLOYER_ADMIN: 'employer_admin',
  EMPLOYER_MEMBER: 'employer_member',
  PLATFORM_ADMIN: 'platform_admin',
  PLATFORM_OPS: 'platform_ops',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

export const SELF_REGISTRATION_ROLES: UserRole[] = [
  ROLES.NURSE,
  ROLES.EMPLOYER_ADMIN,
]

export const ROLE_LABELS: Record<UserRole, string> = {
  nurse: 'Nurse / Healthcare Professional',
  employer_admin: 'Employer (Hospital, Clinic, Care Home)',
  employer_member: 'Employer Team Member',
  platform_admin: 'Platform Administrator',
  platform_ops: 'Platform Operations',
}

export const ROLE_DEFAULT_PATHS: Record<UserRole, string> = {
  nurse: '/nurse/dashboard',
  employer_admin: '/employer/dashboard',
  employer_member: '/employer/dashboard',
  platform_admin: '/admin/dashboard',
  platform_ops: '/admin/dashboard',
}
