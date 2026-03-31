import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Verify your email — Nursly' }

export default function VerifyEmailPage() {
  return (
    <div className="auth-card">
      <h1 className="auth-title">Check your inbox</h1>
      <p className="auth-subtitle">
        We sent a link to confirm your email. It expires in 24 hours.
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
        Once verified, your account will be reviewed by our team. This usually takes less than 24 hours.
        If you do not see the email, check your spam folder.
      </p>
      <div className="auth-footer-link">
        Wrong email address?{' '}
        <Link href="/register">Register again</Link>
      </div>
    </div>
  )
}
