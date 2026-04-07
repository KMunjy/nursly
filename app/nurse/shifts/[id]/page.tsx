import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NurseNav } from '@/components/NurseNav'
import Link from 'next/link'
import ApplyButton from './apply-button'

export const metadata: Metadata = { title: 'Shift Detail â Nursly' }

export default async function ShiftDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user || userError) {
    redirect('/login')
  }

  // Get user's profile
  const { data: profile, error: profileError } = await supabase
    .from('nursly_profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profileError) {
    redirect('/login')
  }

  // Fetch shift details
  const { data: shift, error: shiftError } = await supabase
    .from('nursly_shifts')
    .select(`
      id,
      title,
      specialty,
      band,
      start_time,
      end_time,
      break_minutes,
      rate_per_hour,
      min_experience_years,
      required_credentials,
      notes,
      nursly_organisations(id, name)
    `)
    .eq('id', params.id)
    .single()

  if (!shift || shiftError) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
        <NurseNav active="/nurse/shifts" />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
          <Link href="/nurse/shifts" style={{ color: '#005eb8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            â Back to shifts
          </Link>
          <div style={{ marginTop: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#718096' }}>Shift not found</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('nursly_shift_applications')
    .select('id, status')
    .eq('shift_id', params.id)
    .eq('nurse_id', profile.id)
    .single()

  const start = new Date(shift.start_time)
  const end = new Date(shift.end_time)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = Math.round((durationMs / 3600000) * 10) / 10

  const specialtyDisplay = (shift.specialty as string)?.replace(/_/g, ' ')
  const bandDisplay = (shift.band as string)?.replace('band_', '')

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/shifts" />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        {/* Back Link */}
        <Link
          href="/nurse/shifts"
          style={{
            color: '#005eb8',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '24px',
          }}
        >
          â Back to shifts
        </Link>

        {/* Shift Header */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#212b32', margin: '0 0 8px 0' }}>
              {shift.title}
            </h1>
            <p style={{ fontSize: '16px', color: '#005eb8', fontWeight: '600', margin: 0 }}>
              {(shift.nursly_organisations as any)?.name || 'Healthcare Employer'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span
              style={{
                background: '#f0f4f5',
                color: '#212b32',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {specialtyDisplay}
            </span>
            <span
              style={{
                background: '#f0f4f5',
                color: '#212b32',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Band {bandDisplay}
            </span>
            <span
              style={{
                background: '#d4edda',
                color: '#004d25',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              Â£{shift.rate_per_hour}/hr
            </span>
          </div>

          {/* Application Status */}
          {existingApplication && (
            <div
              style={{
                background: '#d1ecf1',
                border: '1px solid #bee5eb',
                color: '#0c5460',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              You have already applied for this shift (Status: <strong>{existingApplication.status}</strong>)
            </div>
          )}
        </div>

        {/* Shift Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <DetailCard label="ð Date" value={start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
          <DetailCard label="ð Time" value={`${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} â ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`} />
          <DetailCard label="â±ï¸ Duration" value={`${durationHours} hours`} />
          {shift.break_minutes && <DetailCard label="â Break" value={`${shift.break_minutes} minutes`} />}
        </div>

        {/* Requirements */}
        {(shift.min_experience_years > 0 || (shift.required_credentials as any)?.length > 0) && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#212b32', marginBottom: '16px', margin: 0 }}>
              Requirements
            </h2>
            <div style={{ marginTop: '16px' }}>
              {shift.min_experience_years > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#718096', fontWeight: '500', margin: '0 0 4px 0' }}>
                    Minimum Experience
                  </p>
                  <p style={{ fontSize: '14px', color: '#212b32', margin: 0 }}>
                    {shift.min_experience_years} year{shift.min_experience_years !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
              {(shift.required_credentials as any)?.length > 0 && (
                <div>
                  <p style={{ fontSize: '13px', color: '#718096', fontWeight: '500', margin: '0 0 8px 0' }}>
                    Required Credentials
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(shift.required_credentials as string[]).map((c: string) => (
                      <span key={c} style={{ background: '#f0f4f5', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#212b32', fontWeight: 500 }}>
                        {c.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {shift.notes && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#212b32', marginBottom: '12px', margin: 0 }}>
              Additional Notes
            </h2>
            <p style={{ fontSize: '14px', color: '#718096', lineHeight: 1.6, margin: '16px 0 0 0', whiteSpace: 'pre-wrap' }}>
              {shift.notes}
            </p>
          </div>
        )}

        {/* Apply Button */}
        {!existingApplication && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <ApplyButton shiftId={params.id} nurseId={profile.id} />
          </div>
        )}
      </div>
    </div>
  )
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: '13px', color: '#718096', fontWeight: '500', margin: '0 0 8px 0' }}>
        {label}
      </p>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#212b32', margin: 0 }}>
        {value}
      </p>
    </div>
  )
}
