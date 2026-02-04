import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('Current user:', user?.id, user?.email)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 })
    }

    // Check if user is super admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('id', user.id)
      .single()

    console.log('Admin user check:', adminUser, adminError)

    if (adminError || !adminUser) {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 403 })
    }

    if (!adminUser.is_active) {
      return NextResponse.json({ error: 'Admin account is inactive' }, { status: 403 })
    }

    if (adminUser.role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Only super admins can create admin users',
        currentRole: adminUser.role 
      }, { status: 403 })
    }

    // Get form data
    const body = await request.json()
    const { email, name, role } = body

    console.log('Creating admin:', { email, name, role })

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if email already exists in admin_users
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .maybeSingle()

    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Admin user with this email already exists' 
      }, { status: 400 })
    }

    console.log('Creating auth user via signUp...')

    // Generate a secure random password
    const tempPassword = Math.random().toString(36).slice(-12) + 
                        Math.random().toString(36).slice(-12) + 
                        'A1!'

    // Create auth user with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          name,
          role: 'admin'
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin-login`
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json({ 
        error: `Failed to create user: ${authError.message}` 
      }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ 
        error: 'No user returned from signup' 
      }, { status: 500 })
    }

    console.log('Auth user created:', authData.user.id)

    // Add to admin_users table
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role,
        is_active: true
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ 
        error: `Failed to add to admin_users: ${insertError.message}` 
      }, { status: 500 })
    }

    console.log('✅ Admin user created successfully')

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully. Invitation email sent.',
      userId: authData.user.id,
      email: authData.user.email
    })

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    )
  }
}