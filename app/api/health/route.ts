import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('nursly_profiles').select('id').limit(1)
    return NextResponse.json({ status: 'ok', db: !error, ts: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'error', db: false }, { status: 500 })
  }
}
