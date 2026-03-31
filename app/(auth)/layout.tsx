import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="auth-logo-mark">Nursly</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Healthcare Staffing
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {children}
      </div>
    </div>
  )
}
