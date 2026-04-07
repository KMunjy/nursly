'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { EmployerNav } from '@/components/EmployerNav'
import Link from 'next/link'

const SPECIALTIES = [
  'accident_emergency',
  'cardiology',
  'community',
  'critical_care',
  'elderly_care',
  'endoscopy',
  'general_medical',
  'general_surgical',
  'maternity',
  'mental_health',
  'neonatal',
  'neurology',
  'oncology',
  'orthopaedics',
  'paediatrics',
  'radiology',
  'rehabilitation',
  'renal',
  'respiratory',
  'theatre',
]

const BANDS = [
  'band_5',
  'band_6',
  'band_7',
  'band_8a',
  'enrolled_nurse',
  'healthcare_assistant',
]

const CREDENTIALS = [
  { value: 'dbs_certificate', label: 'DBS Certificate' },
  { value: 'hepatitis_b', label: 'Hepatitis B' },
  { value: 'mandatory_training', label: 'Mandatory Training' },
  { value: 'nmc_registration', label: 'NMC Registration' },
  { value: 'other', label: 'Other' },
  { value: 'professional_indemnity', label: 'Professional Indemnity' },
  { value: 'right_to_work', label: 'Right to Work' },
]

export default function PostShiftPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    title: '',
    specialty: '',
    band: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    breakMinutes: '30',
    ratePerHour: '',
    rateNegotiable: false,
    minExperienceYears: '0',
    requiredCredentials: [] as string[],
    notes: '',
  })

  // Fetch user and org data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        const { data: profileData } = await supabase
          .from('nursly_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        setProfile(profileData)

        const { data: membershipData } = await supabase
          .from('nursly_org_members')
          .select('org_id')
          .eq('user_id', user.id)
          .single()

        if (!membershipData?.org_id) {
          router.push('/login')
          return
        }

        setOrgId(membershipData.org_id)
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Role title is required'
    if (!formData.specialty) newErrors.specialty = 'Specialty is required'
    if (!formData.band) newErrors.band = 'Band level is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.ratePerHour) newErrors.ratePerHour = 'Rate per hour is required'

    const breakMins = parseInt(formData.breakMinutes) || 0
    if (breakMins < 0) newErrors.breakMinutes = 'Break minutes cannot be negative'

    const rate = parseFloat(formData.ratePerHour)
    if (isNaN(rate) || rate <= 0) newErrors.ratePerHour = 'Rate must be a positive number'

    const experience = parseInt(formData.minExperienceYears) || 0
    if (experience < 0) newErrors.minExperienceYears = 'Experience years cannot be negative'

    // Validate times
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

    if (endDateTime <= startDateTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (status: 'draft' | 'open') => {
    if (!validateForm()) return
    if (!user || !orgId) return

    setSubmitting(true)

    try {
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`

      const { error } = await supabase.from('nursly_shifts').insert([
        {
          org_id: orgId,
          posted_by: user.id,
          title: formData.title,
          specialty: formData.specialty,
          band: formData.band,
          start_time: startDateTime,
          end_time: endDateTime,
          break_minutes: parseInt(formData.breakMinutes) || 30,
          rate_per_hour: parseFloat(formData.ratePerHour),
          rate_is_negotiable: formData.rateNegotiable,
          min_experience_years: parseInt(formData.minExperienceYears) || 0,
          required_credentials: formData.requiredCredentials.length > 0 ? formData.requiredCredentials : [],
          notes: formData.notes || null,
          status: status,
        },
      ])

      if (error) {
        console.error('Error inserting shift:', error)
        setErrors({ submit: 'Failed to save shift. Please try again.' })
        return
      }

      router.push('/employer/shifts')
    } catch (error) {
      console.error('Error:', error)
      setErrors({ submit: 'An unexpected error occurred.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    const isNumber = type === 'number'

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }))

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCredentialChange = (credential: string) => {
    setFormData(prev => ({
      ...prev,
      requiredCredentials: prev.requiredCredentials.includes(credential)
        ? prev.requiredCredentials.filter(c => c !== credential)
        : [...prev.requiredCredentials, credential],
    }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
        <EmployerNav active="/employer/shifts" userName="" />
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px', width: '100%', textAlign: 'center' }}>
          <p style={{ color: '#718096' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <EmployerNav active="/employer/shifts" userName={profile?.full_name || ''} />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/employer/shifts" style={{ color: '#005eb8', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            â Back to shifts
          </Link>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#212b32', marginBottom: '8px' }}>Post a new shift</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginBottom: '28px', lineHeight: 1.6 }}>
            Fill in the details below to advertise your vacancy to NMC-verified nurses.
          </p>

          {errors.submit && (
            <div style={{ background: '#fdecea', border: '1px solid #f5c2c7', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#8b1912' }}>
              {errors.submit}
            </div>
          )}

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                Role title <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Staff Nurse - Medical Ward"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '15px',
                  border: `1px solid ${errors.title ? '#e74c3c' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              {errors.title && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.title}</p>}
            </div>

            {/* Specialty and Band */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  Specialty <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.specialty ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map(spec => (
                    <option key={spec} value={spec}>
                      {spec.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {errors.specialty && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.specialty}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  Band level <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <select
                  name="band"
                  value={formData.band}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.band ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select band</option>
                  {BANDS.map(band => (
                    <option key={band} value={band}>
                      {band.replace('band_', 'Band ').toUpperCase()}
                    </option>
                  ))}
                </select>
                {errors.band && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.band}</p>}
              </div>
            </div>

            {/* Start Date and Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  Start date <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.startDate ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.startDate && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.startDate}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  Start time <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.startTime ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.startTime && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.startTime}</p>}
              </div>
            </div>

            {/* End Date and Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  End date <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.endDate ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.endDate && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.endDate}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  End time <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.endTime ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.endTime && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.endTime}</p>}
              </div>
            </div>

            {/* Break Minutes and Rate */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  Break (minutes)
                </label>
                <input
                  type="number"
                  name="breakMinutes"
                  value={formData.breakMinutes}
                  onChange={handleInputChange}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.breakMinutes ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.breakMinutes && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.breakMinutes}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                  Rate per hour (Â£) <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <input
                  type="number"
                  name="ratePerHour"
                  value={formData.ratePerHour}
                  onChange={handleInputChange}
                  placeholder="e.g., 18.50"
                  step="0.01"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '15px',
                    border: `1px solid ${errors.ratePerHour ? '#e74c3c' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.ratePerHour && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.ratePerHour}</p>}
              </div>
            </div>

            {/* Rate Negotiable */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rateNegotiable"
                name="rateNegotiable"
                checked={formData.rateNegotiable}
                onChange={handleInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="rateNegotiable" style={{ fontSize: '14px', color: '#212b32', fontWeight: 500, cursor: 'pointer' }}>
                Rate is negotiable
              </label>
            </div>

            {/* Min Experience */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                Minimum experience (years)
              </label>
              <input
                type="number"
                name="minExperienceYears"
                value={formData.minExperienceYears}
                onChange={handleInputChange}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '15px',
                  border: `1px solid ${errors.minExperienceYears ? '#e74c3c' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              {errors.minExperienceYears && <p style={{ fontSize: '13px', color: '#e74c3c', marginTop: '4px' }}>{errors.minExperienceYears}</p>}
            </div>

            {/* Required Credentials */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '12px' }}>
                Required credentials
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CREDENTIALS.map(credential => (
                  <div key={credential.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id={credential.value}
                      checked={formData.requiredCredentials.includes(credential.value)}
                      onChange={() => handleCredentialChange(credential.value)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor={credential.value} style={{ fontSize: '14px', color: '#212b32', cursor: 'pointer' }}>
                      {credential.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }}>
                Additional notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional information about the shift..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '15px',
                  border: `1px solid ${errors.notes ? '#e74c3c' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '28px' }}>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
                style={{
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  color: '#005eb8',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Saving...' : 'Save as draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('open')}
                disabled={submitting}
                style={{
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  background: '#007f3b',
                  color: '#fff',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Posting...' : 'Post shift'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
