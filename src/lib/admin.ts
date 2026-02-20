import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ================================================================
// Check Admin Access (Server-side)
// ================================================================
export async function checkAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false, user: null }
  }

  // ✅ FIXED: Changed from admin_roles to admin_users
  // ✅ FIXED: Changed from user_id to id
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  const isAdmin = adminUser?.is_active && 
    (adminUser.role === 'admin' || adminUser.role === 'super_admin')

  return { isAdmin, user, role: adminUser?.role }
}

// ================================================================
// Supabase Admin Client (For sending invites, etc.)
// ================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export function isAdminClientAvailable(): boolean {
  return supabaseAdmin !== null
}