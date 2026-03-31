import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Account under review — Nursly' }

export default function PendingReviewPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--nhs-blue)', borderBottom: '4px solid var(--nhs-blue-dark)', padding: '14px 24px' }}>
        <span style={{ background: '#fff', color: 'var(--nhs-blue)', fontWeight: 800, fontSize: '15px', padding: '3px 8px', borderRadius: '2px', marginRight: '12px' }}>N</span>
        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>Nursly — Healthcare Staffing</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: '520px', width: '100%' }}>
          <div className="auth-card">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <h1 className="auth-title">Account under review</h1>
              <p className="auth-subtitle">Thank you for registering with Nursly.</p>
            </div>

            <div className="pending-banner">
              <strong>What happens next?</strong><br/>
              Our team is reviewing your account. This usually takes less than 24 hours. You&apos;ll receive an email at your registered address once your account is active.
            </div>

            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
              <p style={{ marginBottom: '8px' }}>For nurses, we verify:</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>✓ NMC registration status</li>
                <li>✓ Right to work documentation</li>
                <li>✓ DBS check details</li>
              </ul>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
              Questions? Contact us at{' '}
              <a href="mailto:support@nursly.com">support@nursly.com</a>
              {' '}or call <strong>0800 123 4567</strong> (Mon–Fri, 8am–6pm)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
