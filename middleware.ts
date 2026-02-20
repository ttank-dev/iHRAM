import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === '/admin-login') {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }

      // ✅ FIXED: admin_roles → admin_users, user_id → id
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('id', user.id)
        .single()

      if (!adminUser || !adminUser.is_active) {
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }
    }

    // Protect merchant dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const { data: agency } = await supabase
        .from('agencies')
        .select('is_active')
        .eq('user_id', user.id)
        .single()

      if (agency && !agency.is_active) {
        await supabase.auth.signOut()
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'suspended')
        return NextResponse.redirect(loginUrl)
      }
    }

    // Merchant login redirect
    if (request.nextUrl.pathname === '/login' && user) {
      const { data: agency } = await supabase
        .from('agencies')
        .select('is_active')
        .eq('user_id', user.id)
        .single()

      if (agency && !agency.is_active) {
        await supabase.auth.signOut()
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'suspended')
        return NextResponse.redirect(loginUrl)
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/admin-login', '/login'],
}