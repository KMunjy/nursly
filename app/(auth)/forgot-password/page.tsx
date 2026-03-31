import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Reset your password — Nursly' }

export default function ForgotPasswordPage() {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,94,184,0.08)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #005eb8 0%, #0072e5 100%)',
        padding: '28px 32px 24px', color: '#fff',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Reset your password</h1>
        <p style={{ fontSize: '14px', opacity: 0.88, marginTop: '6px' }}>
          Enter your email and we'll send you a secure reset link
        </p>
      </div>
      <div style={{ padding: '28px 32px' }}>
        <ForgotPasswordForm />
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <Link href="/login" style={{ color: '#005eb8', fontWeight: 600 }}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
