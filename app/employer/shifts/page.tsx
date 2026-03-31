import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployerNav } from '@/components/EmployerNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Manage Shifts — Nursly' }

export default async function EmployerShiftsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()
  const { data: membership } = await supabase.from('nursly_org_members').select('org_id').eq('user_id', user.id).single()

  const { data: shifts } = membership ? await supabase
    .from('nursly_shifts')
    .select('id, title, specialty, band, start_time, end_time, rate_per_hour, status')
    .eq('org_id', membership.org_id)
    .order('created_at', { ascending: false })
    .limit(30) : { data: [] }

  const statusConfig: Record<string, { bg: string; text: string }> = {
    draft:     { bg: '#f0f4f5', text: '#718096' },
    open:      { bg: '#d8e8f7', text: '#003d78' },
    filled:    { bg: '#d4edda', text: '#004d25' },
    cancelled: { bg: '#fdecea', text: '#8b1912' },
    completed: { bg: '#f0f4f5', text: '#4a5568' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <EmployerNav active="/employer/shifts" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32' }}>Manage shifts</h1>
            <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>{shifts?.length || 0} shifts total</p>
          </div>
          <Link href="/employer/shifts/new" style={{ background: '#007f3b', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
            ➕ Post new shift
          </Link>
        </div>

        {shifts && shifts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shifts.map((shift: any) => {
              const sc = statusConfig[shift.status] || statusConfig.draft
              const start = new Date(shift.start_time)
              return (
                <div key={shift.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#212b32', marginBottom: '4px' }}>{shift.title}</div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                      {shift.specialty?.replace(/_/g,' ')} · Band {shift.band?.replace('band_','')} · {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · £{shift.rate_per_hour}/hr
                    </div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.text, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {shift.status}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#212b32', marginBottom: '8px' }}>No shifts yet</h2>
            <p style={{ fontSize: '15px', color: '#718096', marginBottom: '24px' }}>Post your first shift to start connecting with verified nurses.</p>
            <Link href="/employer/shifts/new" style={{ background: '#007f3b', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
              Post a shift →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
