import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in — Nursly' }

export default function LoginPage() {
  return (
    <div className="auth-card">
      <div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">For registered nurses and healthcare employers.</p>
      </div>
      <Suspense fallback={<div>Loading…</div>}>
        <LoginForm />
      </Suspense>
      <div className="auth-footer-link">
        No account yet? <Link href="/register">Create one</Link>
      </div>
    </div>
  )
}
