import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ================================================================
// EXISTING: Check Admin Access (Server-side)
// ================================================================
export async function checkAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false, user: null }
  }

  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role, is_active')
    .eq('user_id', user.id)
    .single()

  const isAdmin = adminRole?.is_active && 
    (adminRole.role === 'admin' || adminRole.role === 'super_admin')

  return { isAdmin, user, role: adminRole?.role }
}

// ================================================================
// NEW: Supabase Admin Client (For sending invites, etc.)
// ================================================================
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key (NOT anon key!)
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)