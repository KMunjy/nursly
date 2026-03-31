import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { isSafeRedirect } from '@/lib/auth/redirects'

const PUBLIC_ROUTES = [
  '/login', '/register', '/verify-email', '/forgot-password',
  '/auth/callback', '/pending-review', '/account-suspended',
]

const PROTECTED_ROUTES: Record<string, string[]> = {
  '/nurse':    ['nurse'],
  '/employer': ['employer_admin', 'employer_member'],
  '/admin':    ['platform_admin', 'platform_ops'],
}

const ROLE_DEFAULT_PATHS: Record<string, string> = {
  nurse:           '/nurse/dashboard',
  employer_admin:  '/employer/dashboard',
  employer_member: '/employer/dashboard',
  platform_admin:  '/admin/dashboard',
  platform_ops:    '/admin/dashboard',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const { supabaseResponse, user } = await updateSession(request)

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
  if (isPublicRoute) return supabaseResponse

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    const redirectTo = pathname
    if (isSafeRedirect(redirectTo)) {
      loginUrl.searchParams.set('redirectTo', redirectTo)
    }
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=account_setup_failed', request.url))
  }

  if (profile.status === 'pending_verification') {
    if (pathname !== '/verify-email') {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
    return supabaseResponse
  }

  if (profile.status === 'pending_review') {
    if (pathname !== '/pending-review') {
      return NextResponse.redirect(new URL('/pending-review', request.url))
    }
    return supabaseResponse
  }

  if (profile.status === 'suspended' || profile.status === 'deactivated') {
    return NextResponse.redirect(new URL('/account-suspended', request.url))
  }

  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find(
    (prefix) => pathname.startsWith(prefix)
  )

  if (matchedPrefix) {
    const allowedRoles = PROTECTED_ROUTES[matchedPrefix]
    if (!allowedRoles.includes(profile.role)) {
      const defaultPath = ROLE_DEFAULT_PATHS[profile.role] ?? '/login'
      return NextResponse.redirect(new URL(defaultPath, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
