import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Timesheets — Nursly' }

export default async function NurseTimesheetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/timesheets" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32' }}>Timesheets</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>Submit and track your timesheets for completed shifts.</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#212b32', marginBottom: '8px' }}>No timesheets yet</h2>
          <p style={{ fontSize: '15px', color: '#718096', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 24px' }}>
            After completing a shift, you'll be able to submit your timesheet here for employer sign-off and payment.
          </p>
          <Link href="/nurse/shifts" style={{ background: '#005eb8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
            Find shifts →
          </Link>
        </div>
      </div>
    </div>
  )
}
