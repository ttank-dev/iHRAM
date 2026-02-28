import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebarClient from './AdminSidebarClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, user } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  // Fetch admin name from admin_roles
  let adminName = 'Admin'
  if (user) {
    const supabase = await createClient()
    const { data: adminRole } = await supabase
      .from('admin_roles')
      .select('name')
      .eq('user_id', user.id)
      .single()

    // Fallback: name from admin_roles → email prefix
    adminName = adminRole?.name || user.email?.split('@')[0] || 'Admin'
  }

  return (
    <AdminSidebarClient adminName={adminName}>
      {children}
    </AdminSidebarClient>
  )
}