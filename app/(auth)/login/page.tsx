import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in — Nursly' }

export default function LoginPage() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,94,184,0.08)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #005eb8 0%, #0072e5 100%)',
        padding: '28px 32px 24px',
        color: '#fff',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Welcome back</h1>
        <p style={{ fontSize: '14px', opacity: 0.88, marginTop: '6px' }}>
          Sign in to find shifts or manage your team
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: '28px 32px' }}>
        <div style={{
          background: '#f0f9f4', border: '1px solid #c6e8d4',
          borderRadius: '8px', padding: '12px 16px',
          marginBottom: '24px', fontSize: '14px', color: '#1a5e35',
          display: 'flex', alignItems: 'flex-start', gap: '10px', lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
          <span>Your details are secure. We verify all nurses against the NMC register.</span>
        </div>

        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>Loading…</div>}>
          <LoginForm />
        </Suspense>

        <div style={{
          marginTop: '20px', textAlign: 'center',
          fontSize: '14px', color: '#718096',
          paddingTop: '16px', borderTop: '1px solid #e2e8f0',
        }}>
          New to Nursly?{' '}
          <Link href="/register" style={{ color: '#005eb8', fontWeight: 700, textDecoration: 'underline' }}>
            Create a free account →
          </Link>
        </div>
      </div>
    </div>
  )
}
