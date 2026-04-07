'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NurseNav } from '@/components/NurseNav'

const SPECIALTIES = [
  { value: 'accident_emergency', label: 'Accident & Emergency' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'community', label: 'Community' },
  { value: 'critical_care', label: 'Critical Care' },
  { value: 'elderly_care', label: 'Elderly Care' },
  { value: 'endoscopy', label: 'Endoscopy' },
  { value: 'general_medical', label: 'General Medical' },
  { value: 'general_surgical', label: 'General Surgical' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'neonatal', label: 'Neonatal' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'orthopaedics', label: 'Orthopaedics' },
  { value: 'paediatrics', label: 'Paediatrics' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'renal', label: 'Renal' },
  { value: 'respiratory', label: 'Respiratory' },
  { value: 'theatre', label: 'Theatre' },
]

interface FormData {
  nmc_pin: string
  phone_number: string
  location_city: string
  location_postcode: string
  specialties: string[]
  years_experience: string
  preferred_radius_km: string
}

export default function NurseOnboardingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormData>({
    nmc_pin: '',
    phone_number: '',
    location_city: '',
    location_postcode: '',
    specialties: [],
    years_experience: '',
    preferred_radius_km: '25',
  })

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase.from('nursly_profiles').select('full_name').eq('id', user.id).single()
      if (profile?.full_name) setUserName(profile.full_name)

      const { data: nurseProfile } = await supabase.from('nursly_nurse_profiles').select('*').eq('id', user.id).single()
      if (nurseProfile) {
        setForm({
          nmc_pin: nurseProfile.nmc_pin || '',
          phone_number: nurseProfile.phone_number || '',
          location_city: nurseProfile.location_city || '',
          location_postcode: nurseProfile.location_postcode || '',
          specialties: nurseProfile.specialties || [],
          years_experience: nurseProfile.years_experience?.toString() || '',
          preferred_radius_km: nurseProfile.preferred_radius_km?.toString() || '25',
        })
      }
      setLoading(false)
    }
    init()
  }, [router])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nmc_pin.trim()) e.nmc_pin = 'Required'
    else if (!/^\d{7}[A-Za-z]$/.test(form.nmc_pin.trim()) && !/^\d{7,8}$/.test(form.nmc_pin.trim()))
      e.nmc_pin = 'Enter a valid NMC PIN (e.g. 1234567C)'
    if (!form.phone_number.trim()) e.phone_number = 'Required'
    if (!form.location_city.trim()) e.location_city = 'Required'
    if (!form.location_postcode.trim()) e.location_postcode = 'Required'
    if (form.specialties.length === 0) e.specialties = 'Select at least one'
    if (!form.years_experience) e.years_experience = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (name: string, value: string) => {
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n })
  }

  const toggleSpecialty = (v: string) => {
    setForm(p => ({
      ...p,
      specialties: p.specialties.includes(v) ? p.specialties.filter(s => s !== v) : [...p.specialties, v],
    }))
    if (errors.specialties) setErrors(p => { const n = { ...p }; delete n.specialties; return n })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !userId) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('nursly_nurse_profiles').upsert({
      id: userId,
      nmc_pin: form.nmc_pin.trim(),
      phone_number: form.phone_number.trim(),
      location_city: form.location_city.trim(),
      location_postcode: form.location_postcode.trim().toUpperCase(),
      specialties: form.specialties,
      years_experience: parseInt(form.years_experience),
      preferred_radius_km: parseInt(form.preferred_radius_km) || 25,
      onboarding_complete: true,
    }, { onConflict: 'id' })
    setSaving(false)
    if (error) { setErrors({ submit: 'Failed to save â please try again.' }); return }
    router.push('/nurse/dashboard')
  }

  const inputStyle = (field: string) => ({
    width: '100%', padding: '10px 14px', fontSize: '14px', fontFamily: 'inherit',
    border: `1px solid ${errors[field] ? '#d32f2f' : '#e2e8f0'}`, borderRadius: '8px',
    backgroundColor: '#fff', color: '#212b32', boxSizing: 'border-box' as const,
  })

  const labelStyle = { display: 'block' as const, fontSize: '13px', fontWeight: 600, color: '#212b32', marginBottom: '6px' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#718096', fontSize: '15px' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f5', display: 'flex', flexDirection: 'column' }}>
      <NurseNav active="/nurse/profile" userName={userName} />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#212b32', marginBottom: '6px' }}>Complete your profile</h1>
          <p style={{ fontSize: '15px', color: '#718096' }}>Fill in your details to start applying for shifts. Takes about 3 minutes.</p>
        </div>

        {errors.submit && (
          <div style={{ background: '#fdecea', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#8b1912' }}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* NMC & Phone */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Registration details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>NMC PIN *</label>
                <input value={form.nmc_pin} onChange={e => handleChange('nmc_pin', e.target.value)} placeholder="e.g. 1234567C" maxLength={8} style={inputStyle('nmc_pin')} />
                {errors.nmc_pin && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.nmc_pin}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone number *</label>
                <input type="tel" value={form.phone_number} onChange={e => handleChange('phone_number', e.target.value)} placeholder="07700 123456" style={inputStyle('phone_number')} />
                {errors.phone_number && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.phone_number}</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Location & availability</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input value={form.location_city} onChange={e => handleChange('location_city', e.target.value)} placeholder="e.g. Manchester" style={inputStyle('location_city')} />
                {errors.location_city && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.location_city}</p>}
              </div>
              <div>
                <label style={labelStyle}>Postcode *</label>
                <input value={form.location_postcode} onChange={e => handleChange('location_postcode', e.target.value)} placeholder="M1 2AB" style={inputStyle('location_postcode')} />
                {errors.location_postcode && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.location_postcode}</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Preferred travel radius (km)</label>
              <input type="number" min="1" max="100" value={form.preferred_radius_km} onChange={e => handleChange('preferred_radius_km', e.target.value)} style={{ ...inputStyle('preferred_radius_km'), maxWidth: '140px' }} />
            </div>
          </div>

          {/* Experience */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>Experience</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Years of experience *</label>
              <input type="number" min="0" max="50" value={form.years_experience} onChange={e => handleChange('years_experience', e.target.value)} placeholder="e.g. 5" style={{ ...inputStyle('years_experience'), maxWidth: '140px' }} />
              {errors.years_experience && <p style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.years_experience}</p>}
            </div>
          </div>

          {/* Specialties */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#212b32', marginBottom: '4px' }}>Specialties *</h2>
            <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>Select all areas you're qualified to work in.</p>
            {errors.specialties && <p style={{ color: '#d32f2f', fontSize: '12px', marginBottom: '12px' }}>{errors.specialties}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
              {SPECIALTIES.map(s => {
                const selected = form.specialties.includes(s.value)
                return (
                  <label key={s.value} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                    border: `2px solid ${selected ? '#005eb8' : '#e2e8f0'}`, borderRadius: '8px',
                    background: selected ? '#e8f0fe' : '#fff', cursor: 'pointer', fontSize: '13px',
                    fontWeight: selected ? 600 : 400, color: '#212b32', transition: 'all 0.15s',
                  }}>
                    <input type="checkbox" checked={selected} onChange={() => toggleSpecialty(s.value)}
                      style={{ accentColor: '#005eb8', width: '16px', height: '16px' }} />
                    {s.label}
                  </label>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '14px', fontSize: '16px', fontWeight: 700, fontFamily: 'inherit',
            background: saving ? '#7faed4' : '#005eb8', color: '#fff', border: 'none',
            borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Saving...' : 'Complete profile & start applying'}
          </button>
        </form>
      </div>
    </div>
  )
}
