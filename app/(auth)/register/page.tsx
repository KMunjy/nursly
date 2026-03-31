import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create account — Nursly' }

export default function RegisterPage() {
  return (
    <div className="auth-card">
      {/* Trust signal */}
      <div className="auth-trust-bar">
        <span className="auth-trust-icon">✅</span>
        <span>Free to join. Nurses are paid promptly and fairly. Employers post shifts in minutes.</span>
      </div>

      <h1 className="auth-title">Create your account</h1>
      <p className="auth-subtitle">Nurses and employers register separately. Choose your account type below.</p>

      <RegisterForm />

      <div className="auth-footer-link">
        Already have an account? <Link href="/login">Sign in</Link>
      </div>
    </div>
  )
}
