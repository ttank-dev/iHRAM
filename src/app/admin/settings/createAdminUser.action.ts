'use server'

import { createClient } from '@supabase/supabase-js'

const getServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

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

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: formData.fullName,
        role: formData.role
      }
    })

    if (authError) return { success: false, error: authError.message }

    const userId = authData.user.id

    // Step 2: Insert into admin_users
    const { error: adminUsersError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: userId,
        email: formData.email,
        full_name: formData.fullName,
        role: formData.role,
        is_active: true
      })

    if (adminUsersError) return { success: false, error: adminUsersError.message }

    // Step 3: Insert into admin_roles (for RLS policies)
    const { error: adminRolesError } = await supabaseAdmin
      .from('admin_roles')
      .insert({
        user_id: userId,
        role: formData.role,
        is_active: true
      })

    // admin_roles insert failure is non-fatal — log it but don't block
    if (adminRolesError) {
      console.warn('admin_roles insert failed:', adminRolesError.message)
    }

    return {
      success: true,
      tempPassword,
      email: formData.email
    }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}