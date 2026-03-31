import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create account — Nursly' }

export default function RegisterPage() {
  return (
    <div className="auth-card">
      {/* Warm welcome header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#EBF4FB',
          border: '1px solid #b3cfe8',
          borderRadius: '100px',
          padding: '6px 16px',
          fontSize: '13px',
          color: '#003d78',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          🤝 Joining 2,400+ healthcare professionals
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">
          Connecting compassionate carers with great workplaces across the UK.
        </p>
      </div>

      {/* Trust bar */}
      <div className="auth-trust-bar" style={{ marginBottom: '28px' }}>
        <span className="auth-trust-icon">✅</span>
        <span>Free to join. Nurses are paid promptly and fairly. Employers post shifts in minutes.</span>
      </div>

      <RegisterForm />

      <div className="auth-footer-link" style={{ marginTop: '24px' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
      </div>
    </div>
  )
}
