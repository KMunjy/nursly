import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Applications — Nursly' }

export default async function NurseApplicationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()
  const { data: applications } = await supabase
    .from('nursly_shift_applications')
    .select(`id, status, applied_at, message, nursly_shifts(id, title, start_time, end_time, rate_per_hour, nursly_organisations(name))`)
    .eq('nurse_id', user.id)
    .order('applied_at', { ascending: false })

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    pending:     { label: 'Pending', bg: '#fff4d0', text: '#7a5900', icon: '⏳' },
    shortlisted: { label: 'Shortlisted', bg: '#d8e8f7', text: '#003d78', icon: '⭐' },
    selected:    { label: 'Confirmed', bg: '#d4edda', text: '#004d25', icon: '✅' },
    rejected:    { label: 'Unsuccessful', bg: '#fdecea', text: '#8b1912', icon: '❌' },
    withdrawn:   { label: 'Withdrawn', bg: '#f0f4f5', text: '#718096', icon: '↩️' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/applications" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32' }}>My applications</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>{applications?.length || 0} total applications</p>
        </div>

        {applications && applications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {applications.map((app: any) => {
              const sc = statusConfig[app.status] || statusConfig.pending
              const shift = app.nursly_shifts
              const start = shift ? new Date(shift.start_time) : null
              return (
                <div key={app.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '4px' }}>
                      {shift?.title || 'Shift application'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '6px' }}>
                      {(shift?.nursly_organisations as any)?.name || 'Healthcare Employer'}
                      {start && ` · ${start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`}
                      {shift?.rate_per_hour && ` · £${shift.rate_per_hour}/hr`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                      Applied {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: sc.bg, color: sc.text, fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#212b32', marginBottom: '8px' }}>No applications yet</h2>
            <p style={{ fontSize: '15px', color: '#718096', marginBottom: '24px' }}>Browse available shifts and apply with one click.</p>
            <Link href="/nurse/shifts" style={{ background: '#005eb8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
              Browse shifts →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
