'use server'

import { createClient } from '@supabase/supabase-js'

// Service Role Client
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

export async function updateAdminPassword(userId: string, newPassword: string) {
  try {
    const supabaseAdmin = getServiceRoleClient()

    // Update password using Service Role
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}