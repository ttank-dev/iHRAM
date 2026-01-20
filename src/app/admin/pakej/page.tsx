import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'

export default async function AdminPakejPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
        Manage Pakej
      </h1>
      <p style={{ color: '#A0A0A0' }}>View and moderate all packages</p>
    </div>
  )
}
