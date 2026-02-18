import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewsFeedClient from './NewsFeedClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewsFeedPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  // Fetch news feed posts
  const { data: posts } = await supabase
    .from('news_feed')
    .select(`
      *,
      agencies:agency_id (id, name)
    `)
    .order('created_at', { ascending: false })

  const safePosts = Array.isArray(posts) ? posts : []

  return <NewsFeedClient initialPosts={safePosts} />
}