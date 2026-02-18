import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GaleriClient from './GaleriClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GaleriPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  const { data: albums } = await supabase
    .from('photo_albums')
    .select(`
      *,
      agencies:agency_id (id, name)
    `)
    .order('created_at', { ascending: false })

  const safeAlbums = Array.isArray(albums) ? albums : []

  return <GaleriClient initialAlbums={safeAlbums} />
}