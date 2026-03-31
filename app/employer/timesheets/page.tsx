import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerNav } from '@/components/EmployerNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Timesheets — Nursly' }

export default async function EmployerTimesheetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <EmployerNav active="/employer/timesheets" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32', marginBottom: '8px' }}>Timesheets</h1>
        <p style={{ fontSize: '15px', color: '#718096', marginBottom: '28px' }}>Review and approve submitted timesheets from your staff.</p>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#212b32', marginBottom: '8px' }}>No timesheets to review</h2>
          <p style={{ fontSize: '15px', color: '#718096', marginBottom: '24px' }}>When nurses complete their shifts, their timesheets will appear here for your sign-off.</p>
          <Link href="/employer/shifts/new" style={{ background: '#005eb8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>Post a shift →</Link>
        </div>
      </div>
    </div>
  )
}
