import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Next.js 14+ cookies() returns a Promise in some versions
        // Use synchronous pattern compatible with both
        getAll() {
          // @ts-ignore — works at runtime, types differ across Next.js versions
          return typeof cookieStore.getAll === 'function'
            ? (cookieStore as any).getAll()
            : []
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              // @ts-ignore
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from Server Component — read-only, handled by middleware
          }
        },
      },
    }
  )
}
