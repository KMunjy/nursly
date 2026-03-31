import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in — Nursly' }

export default function LoginPage() {
  return (
    <div className="auth-card">
      {/* Trust signal */}
      <div className="auth-trust-bar">
        <span className="auth-trust-icon">🔒</span>
        <span>Your details are secure. We verify all nurses against the NMC register before activation.</span>
      </div>

      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Sign in to find shifts or manage your team.</p>

      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</div>}>
        <LoginForm />
      </Suspense>

      <div className="auth-footer-link">
        New to Nursly? <Link href="/register">Create a free account</Link>
      </div>
    </div>
  )
}
