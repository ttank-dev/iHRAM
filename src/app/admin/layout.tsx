import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import AdminSidebarClient from './AdminSidebarClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  return (
    <AdminSidebarClient>
      {children}
    </AdminSidebarClient>
  )
}