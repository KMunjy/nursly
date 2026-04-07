'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ApplyButton({ shiftId, nurseId }: { shiftId: string; nurseId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from('nursly_shift_applications').insert([
        {
          shift_id: shiftId,
          nurse_id: nurseId,
          status: 'pending',
          applied_at: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError

      setIsApplied(true)
    } catch (err: any) {
      setError(err.message || 'Failed to apply. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isApplied) {
    return (
      <button
        disabled
        style={{
          background: '#d4edda',
          color: '#004d25',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '15px',
          border: 'none',
          cursor: 'default',
        }}
      >
        â Applied
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={handleApply}
        disabled={isLoading}
        style={{
          background: '#005eb8',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '15px',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? 'Applying...' : 'Apply for this shift'}
      </button>
      {error && (
        <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
