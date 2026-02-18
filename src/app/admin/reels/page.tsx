import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReelsClient from './ReelsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReelsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  // Fetch reels
  const { data: reels } = await supabase
    .from('reels')
    .select(`
      *,
      agencies:agency_id (id, name)
    `)
    .order('created_at', { ascending: false })

  const safeReels = Array.isArray(reels) ? reels : []

  return <ReelsClient initialReels={safeReels} />
}