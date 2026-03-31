'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{email?:string; password?:string}>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  function validate(): boolean {
    const e: {email?:string; password?:string} = {}
    if (!email.includes('@') || !email.includes('.')) e.email = 'Please enter a valid email address'
    if (password.length < 1) e.password = 'Please enter your password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) {
        if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('credentials')) {
          setSubmitError('Email or password is incorrect. Please check your details and try again.')
        } else if (error.message?.toLowerCase().includes('email not confirmed')) {
          setSubmitError('Please verify your email before signing in. Check your inbox for the verification link.')
        } else {
          setSubmitError('Sign in failed. Please try again or contact support@nursly.com.')
        }
        return
      }
      const redirectTo = searchParams.get('redirectTo') || '/'
      router.push(redirectTo)
      router.refresh()
    } catch {
      setSubmitError('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (hasError: boolean, isFocused: boolean) => ({
    width: '100%',
    border: `2px solid ${hasError ? '#fc8181' : isFocused ? '#005eb8' : '#cbd5e0'}`,
    borderRadius: '8px',
    padding: '13px 16px',
    fontSize: '16px',
    color: '#2d3748',
    fontFamily: 'inherit',
    background: hasError ? '#fff5f5' : isFocused ? '#fff' : '#fafbfc',
    outline: 'none',
    boxSizing: 'border-box' as const,
    boxShadow: isFocused ? '0 0 0 3px rgba(0,94,184,0.12)' : '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
  })

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="login-email" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>
          Email address
        </label>
        <input
          id="login-email" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); setSubmitError(null) }}
          onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
          placeholder="you@example.com" autoComplete="email" disabled={loading}
          style={inputStyle(!!errors.email, focused === 'email')}
        />
        {errors.email && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>⚠ {errors.email}</span>}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label htmlFor="login-password" style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: '#2d3748', marginBottom: '6px' }}>
          Password
          <Link href="/forgot-password" style={{ float: 'right', fontSize: '14px', fontWeight: 500, color: '#005eb8', textDecoration: 'underline' }}>
            Forgot password?
          </Link>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="login-password" type={showPw ? 'text' : 'password'} value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); setSubmitError(null) }}
            onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
            placeholder="Your password" autoComplete="current-password" disabled={loading}
            style={{ ...inputStyle(!!errors.password, focused === 'password'), paddingRight: '52px' }}
          />
          <button type="button" onClick={() => setShowPw(s => !s)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#718096', fontSize: '13px', fontFamily: 'inherit', padding: '4px' }}>
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#da291c', marginTop: '5px', fontWeight: 600 }}>⚠ {errors.password}</span>}
      </div>

      {submitError && (
        <div role="alert" style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderLeft: '4px solid #da291c', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px', fontSize: '14px', color: '#742a2a', lineHeight: 1.6, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <span>{submitError}</span>
        </div>
      )}

      <button type="submit" disabled={loading}
        style={{ width: '100%', background: loading ? '#718096' : '#007f3b', color: '#fff', border: 'none', borderRadius: '8px', padding: '15px 20px', fontSize: '17px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 12px rgba(0,127,59,0.3)' }}>
        {loading ? 'Signing in…' : 'Sign in →'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
