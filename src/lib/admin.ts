import { createClient } from '@/lib/supabase/server'

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