import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Timesheets â Nursly' }

export default async function NurseTimesheetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()

  // Fetch shifts assigned to this nurse that need timesheet action
  const { data: shifts } = await supabase
    .from('nursly_shifts')
    .select('id, title, start_time, end_time, break_minutes, rate_per_hour, status, nursly_organisations(name)')
    .eq('filled_by', user.id)
    .in('status', ['filled', 'in_progress', 'completed'])
    .order('start_time', { ascending: false })

  const formatDate = (dt: string) => new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const formatTime = (dt: string) => new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const calcHours = (start: string, end: string, breakMins: number) => {
    const ms = new Date(end).getTime() - new Date(start).getTime()
    return Math.max(0, Math.round((ms / 3600000 - breakMins / 60) * 10) / 10)
  }

  const getStatusColor = (s: string) => s === 'completed' ? '#007f3b' : '#005eb8'
  const getStatusBg = (s: string) => s === 'completed' ? '#e7f4e4' : '#e3f2fd'

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/timesheets" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#212b32' }}>Timesheets</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>Submit and track your timesheets for completed shifts.</p>
        </div>

        {shifts && shifts.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {shifts.map((shift: any) => {
              const hours = calcHours(shift.start_time, shift.end_time, shift.break_minutes || 0)
              const total = (hours * (shift.rate_per_hour || 0)).toFixed(2)
              return (
                <div key={shift.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#212b32', margin: '0 0 4px 0' }}>{shift.title}</h3>
                      <p style={{ color: '#718096', margin: 0, fontSize: '13px' }}>{(shift.nursly_organisations as any)?.name || 'Employer'}</p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 600 }}>Date & Time</p>
                      <p style={{ color: '#212b32', margin: 0, fontSize: '14px', fontWeight: 500 }}>{formatDate(shift.start_time)}</p>
                      <p style={{ color: '#718096', margin: '2px 0 0 0', fontSize: '13px' }}>{formatTime(shift.start_time)} â {formatTime(shift.end_time)}</p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 600 }}>Hours</p>
                      <p style={{ color: '#005eb8', margin: 0, fontSize: '15px', fontWeight: 600 }}>{hours}h</p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 600 }}>Rate</p>
                      <p style={{ color: '#212b32', margin: 0, fontSize: '14px', fontWeight: 500 }}>Â£{Number(shift.rate_per_hour).toFixed(2)}/h</p>
                    </div>
                    <div>
                      <p style={{ color: '#999', fontSize: '11px', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 600 }}>Total Pay</p>
                      <p style={{ color: '#007f3b', margin: 0, fontSize: '16px', fontWeight: 700 }}>Â£{total}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: getStatusBg(shift.status), color: getStatusColor(shift.status), borderRadius: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {shift.status === 'in_progress' ? 'In Progress' : shift.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>ð</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#212b32', marginBottom: '8px' }}>No timesheets yet</h2>
            <p style={{ fontSize: '15px', color: '#718096', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 24px' }}>
              After completing a shift, you'll be able to submit your timesheet here for employer sign-off and payment.
            </p>
            <Link href="/nurse/shifts" style={{ background: '#005eb8', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
              Find shifts â
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
