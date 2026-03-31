import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Check your email — Nursly' }

export default function VerifyEmailPage() {
  return (
    <div className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-subtitle">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account.
        </p>
      </div>

      <div className="info-banner">
        <strong>Can&apos;t find it?</strong> Check your spam or junk folder. The link expires in 24 hours.
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6' }}>
        Once verified, your account will be reviewed by our team — usually within a few hours.
        You&apos;ll get an email when you&apos;re approved.
      </p>

      <div className="auth-footer-link">
        <Link href="/login">Back to sign in</Link>
        {' · '}
        <a href="mailto:support@nursly.com">Contact support</a>
      </div>
    </div>
  )
}
