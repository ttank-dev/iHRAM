import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ModerationLogsClient from './ModerationLogsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LogsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  const { data: logs, count } = await supabase
    .from('moderation_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 19) // First 20 records

  const safeLogs = Array.isArray(logs) ? logs : []
  const totalCount = count || 0

  return <ModerationLogsClient initialLogs={safeLogs} totalCount={totalCount} />
}