import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Find Shifts — Nursly' }

export default async function NurseShiftsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('nursly_profiles').select('full_name').eq('id', user.id).single()

  const { data: shifts } = await supabase
    .from('nursly_shifts')
    .select(`id, title, specialty, band, start_time, end_time, rate_per_hour, notes, nursly_organisations(name)`)
    .eq('status', 'open')
    .order('start_time', { ascending: true })
    .limit(20)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/shifts" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32' }}>Find shifts</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>Browse open shifts from verified healthcare employers across the UK.</p>
        </div>

        {shifts && shifts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {shifts.map((shift: any) => {
              const start = new Date(shift.start_time)
              const end = new Date(shift.end_time)
              const hours = Math.round((end.getTime() - start.getTime()) / 3600000 * 10) / 10
              return (
                <div key={shift.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #005eb8', borderRadius: '10px', padding: '20px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '4px' }}>{shift.title}</div>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>
                      {(shift.nursly_organisations as any)?.name || 'Healthcare Employer'} · {shift.specialty?.replace(/_/g,' ')} · Band {shift.band?.replace('band_','')}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#4a5568' }}>📅 {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span style={{ fontSize: '13px', color: '#4a5568' }}>🕐 {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} ({hours}h)</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#007f3b' }}>💷 £{shift.rate_per_hour}/hr</span>
                    </div>
                  </div>
                  <Link href={`/nurse/shifts/${shift.id}`} style={{ background: '#005eb8', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', flexShrink: 0 }}>
                    View & apply →
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#212b32', marginBottom: '8px' }}>No shifts available right now</h2>
            <p style={{ fontSize: '15px', color: '#718096', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 24px' }}>
              New shifts are posted regularly by NHS trusts, private hospitals, and care homes. Check back soon or complete your profile to get notified.
            </p>
            <Link href="/nurse/profile" style={{ background: '#005eb8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
              Complete my profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
