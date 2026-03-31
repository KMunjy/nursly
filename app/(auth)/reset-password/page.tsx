import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = { title: 'Set new password — Nursly' }

export default function ResetPasswordPage() {
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
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Set your new password</h1>
        <p style={{ fontSize: '14px', opacity: 0.88, marginTop: '6px' }}>
          Choose a strong password to keep your account secure
        </p>
      </div>
      <div style={{ padding: '28px 32px' }}>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
