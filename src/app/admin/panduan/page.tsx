import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'

export default async function AdminPanduanPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
        Manage Panduan
      </h1>
      <p style={{ color: '#A0A0A0' }}>Create and edit guides</p>
    </div>
  )
}
