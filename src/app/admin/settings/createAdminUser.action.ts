'use server'

import { createClient } from '@supabase/supabase-js'

// Service Role Client (has admin privileges)
const getServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Generate random temporary password
const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function createAdminUser(formData: {
  fullName: string
  email: string
  role: 'admin' | 'super_admin'
}) {
  try {
    const supabaseAdmin = getServiceRoleClient()
    const tempPassword = generateTempPassword()

    // Create user with admin privileges
    // NO requires_password_change flag - let them decide!
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        role: formData.role
        // Removed: requires_password_change: true
      }
    })

    if (authError) {
      return {
        success: false,
        error: authError.message
      }
    }

    // Add to admin_users table
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        role: formData.role,
        is_active: true
      })

    if (dbError) {
      return {
        success: false,
        error: dbError.message
      }
    }

    return {
      success: true,
      tempPassword: tempPassword,
      email: formData.email
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}