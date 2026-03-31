import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      {/* NHS-style header bar */}
      <div className="auth-nhs-bar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span className="auth-nhs-logo">N</span>
          <span className="auth-nhs-title">Nursly — Healthcare Staffing</span>
        </Link>
      </div>

      {/* Page body */}
      <div className="auth-body">
        <div className="auth-container">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="nhs-footer">
        <p>Nursly is a registered healthcare staffing platform. All nurses are verified against the NMC register.</p>
        <p style={{ marginTop: '6px' }}>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.7)', marginRight: '16px' }}>Privacy Notice</Link>
          <Link href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', marginRight: '16px' }}>Accessibility</Link>
          <a href="mailto:support@nursly.com" style={{ color: 'rgba(255,255,255,0.7)' }}>support@nursly.com</a>
        </p>
      </footer>
    </div>
  )
}
