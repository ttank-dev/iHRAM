import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VerificationClient from './VerificationClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminVerificationPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('verification_requests')
    .select(`
      id,
      created_at,
      company_name,
      motac_license_number,
      status
    `)
    .order('created_at', { ascending: false })

  const safeRequests = requests || []

  const pendingCount = safeRequests.filter(r => r.status === 'pending').length
  const approvedCount = safeRequests.filter(r => r.status === 'approved').length
  const rejectedCount = safeRequests.filter(r => r.status === 'rejected').length

  return (
    <VerificationClient 
      requests={safeRequests}
      pendingCount={pendingCount}
      approvedCount={approvedCount}
      rejectedCount={rejectedCount}
    />
  )
}