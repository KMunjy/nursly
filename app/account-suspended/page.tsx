import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Account suspended — Nursly' }

export default function AccountSuspendedPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--nhs-blue)', borderBottom: '4px solid var(--nhs-blue-dark)', padding: '14px 24px' }}>
        <span style={{ background: '#fff', color: 'var(--nhs-blue)', fontWeight: 800, fontSize: '15px', padding: '3px 8px', borderRadius: '2px', marginRight: '12px' }}>N</span>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>Nursly — Healthcare Staffing</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: '480px', width: '100%' }} className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
            <h1 className="auth-title">Account suspended</h1>
          </div>
          <div className="form-alert">
            Your account has been temporarily suspended. This may be due to a compliance review or outstanding documentation.
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Please contact our support team to resolve this.{' '}
            We aim to respond within 2 working hours during business hours.
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <a href="mailto:support@nursly.com" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Email support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
