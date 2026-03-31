import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPostAuthRedirect, isSafeRedirect } from '@/lib/auth/redirects'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(`${origin}/login?error=no_profile`)
  }

  // Honour safe redirectTo if passed
  if (next && next !== '/' && isSafeRedirect(next)) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  const { data: nurseProfile } = profile.role === 'nurse'
    ? await supabase.from('nurse_profiles').select('onboarding_complete').eq('id', user.id).single()
    : { data: null }

  const redirectPath = getPostAuthRedirect(
    profile.role as any,
    nurseProfile?.onboarding_complete ?? false
  )

  return NextResponse.redirect(`${origin}${redirectPath}`)
}
