import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔵 Middleware hit:', request.nextUrl.pathname)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.next()
  }

  // Skip middleware for admin login (now at /admin-login)
  if (request.nextUrl.pathname === '/admin-login') {
    console.log('✅ Allowing /admin-login')
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
    console.log('User:', user?.email || 'Not logged in')

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('🔒 Protecting /admin')
      
      if (!user) {
        console.log('❌ No user, redirect to /admin-login')
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }

      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single()

      if (!adminRole?.is_active) {
        console.log('❌ Not admin')
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }

      console.log('✅ Admin verified')
    }

    // Protect merchant dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('🔒 Protecting /dashboard')
      
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