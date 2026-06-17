import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session — required for SSR
  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  function redirectTo(path: string) {
    const url = request.nextUrl.clone()
    url.pathname = path
    return NextResponse.redirect(url)
  }

  // Not logged in — protect private routes
  if (!user) {
    if (pathname.startsWith('/app') || pathname.startsWith('/admin') || pathname === '/') {
      return redirectTo('/login')
    }
    return response
  }

  // Logged in — get role from JWT metadata (no extra DB query)
  const role = user.user_metadata?.role as string | undefined

  // Redirect / based on role
  if (pathname === '/') {
    return role === 'admin' ? redirectTo('/admin') : redirectTo('/app')
  }

  // /login while logged in → redirect to dashboard
  if (pathname === '/login') {
    return role === 'admin' ? redirectTo('/admin') : redirectTo('/app')
  }

  // /app/* — patients only
  if (pathname.startsWith('/app') && role === 'admin') {
    return redirectTo('/admin')
  }

  // /admin/* — admins only
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return redirectTo('/app')
  }

  return response
}

export const config = {
  matcher: ['/', '/login', '/app/:path*', '/admin/:path*'],
}
