import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #eef6ff 0%, #f0f9f5 50%, #fff9f0 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top nav */}
      <nav style={{
        background: '#005eb8',
        borderBottom: '4px solid #003d78',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', color: '#fff',
        }}>
          <span style={{
            background: '#fff', color: '#005eb8',
            fontWeight: 900, fontSize: '14px',
            padding: '3px 8px', borderRadius: '3px',
            letterSpacing: '-0.3px',
          }}>N</span>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.2px' }}>Nursly</span>
          <span style={{ fontSize: '12px', opacity: 0.75, marginLeft: '2px' }}>Healthcare Staffing</span>
        </Link>
        <Link href="/login" style={{
          color: 'rgba(255,255,255,0.85)', fontSize: '14px',
          textDecoration: 'none', padding: '6px 14px',
          border: '1px solid rgba(255,255,255,0.35)',
          borderRadius: '6px', fontWeight: 500,
        }}>
          Sign in
        </Link>
      </nav>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#1a2b3d',
        color: 'rgba(255,255,255,0.65)',
        padding: '18px 24px',
        textAlign: 'center',
        fontSize: '13px',
        lineHeight: 1.7,
        flexShrink: 0,
      }}>
        <p>Nursly is a registered healthcare staffing platform. All nurses verified against the NMC register.</p>
        <p style={{ marginTop: '4px' }}>
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.6)', marginRight: '16px', textDecoration: 'underline' }}>Privacy Notice</Link>
          <Link href="/accessibility" style={{ color: 'rgba(255,255,255,0.6)', marginRight: '16px', textDecoration: 'underline' }}>Accessibility</Link>
          <a href="mailto:support@nursly.com" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>support@nursly.com</a>
        </p>
      </footer>
    </div>
  )
}
