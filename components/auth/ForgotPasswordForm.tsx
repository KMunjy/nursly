'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function ForgotPasswordForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    setError(''); setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) {
        setError('Something went wrong. Please try again or contact support@nursly.com.')
      } else {
        setSent(true)
      }
    } finally { setLoading(false) }
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2d3748', marginBottom: '10px' }}>Check your inbox</h2>
        <p style={{ fontSize: '15px', color: '#718096', lineHeight: 1.6, marginBottom: '20px' }}>
          If an account exists for <strong style={{ color: '#2d3748' }}>{email}</strong>, you'll receive a password reset link within a few minutes.
        </p>
        <div style={{ background: '#f0f9f4', border: '1px solid #c6e8d4', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#1a5e35', marginBottom: '20px' }}>
          Can't find it? Check your spam folder. The link expires in 1 hour.
        </div>
        <Link href="/login" style={{ color: '#005eb8', fontWeight: 600, fontSize: '15px' }}>← Back to sign in</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="reset-email" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>
          Email address
        </label>
        <input
          id="reset-email" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="you@example.com" autoComplete="email"
          disabled={loading}
          style={{
            width: '100%', border: `2px solid ${error ? '#fc8181' : '#cbd5e0'}`,
            borderRadius: '8px', padding: '13px 16px', fontSize: '16px',
            color: '#2d3748', fontFamily: 'inherit', background: error ? '#fff5f5' : '#fafbfc',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        {error && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>
            ⚠ {error}
          </span>
        )}
        <p style={{ fontSize: '13px', color: '#718096', marginTop: '8px', lineHeight: 1.5 }}>
          We'll send a secure reset link to this address. For your security, we won't confirm whether the email is registered.
        </p>
      </div>
      <button
        type="submit" disabled={loading}
        style={{
          width: '100%', background: loading ? '#718096' : '#005eb8',
          color: '#fff', border: 'none', borderRadius: '8px',
          padding: '14px 20px', fontSize: '17px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading ? 'Sending…' : 'Send reset link →'}
      </button>
    </form>
  )
}
