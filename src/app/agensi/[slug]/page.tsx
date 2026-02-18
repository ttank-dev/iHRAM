import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AgensiProfileClient from './AgensiProfileClient'

export default async function AgensiProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Get agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!agency) {
    notFound()
  }

  // Get packages
  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // Get reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  // Get news feed posts
  const { data: newsFeed } = await supabase
  .from('news_feed')
  .select('*')
  .eq('agency_id', agency.id)
  .eq('is_active', true)          // ← FILTER ACTIVE ONLY
  .eq('is_published', true)       // ← FILTER PUBLISHED ONLY
  .order('created_at', { ascending: false })
  .limit(10)

  // Get reels
  const { data: reels } = await supabase
  .from('reels')
  .select('*')
  .eq('agency_id', agency.id)
  .eq('is_active', true)          // ← FILTER ACTIVE ONLY
  .eq('is_published', true)       // ← FILTER PUBLISHED ONLY
  .order('created_at', { ascending: false })
  .limit(10)

  // Get photo albums
  const { data: albums } = await supabase
  .from('photo_albums')
  .select('*')
  .eq('agency_id', agency.id)
  .eq('is_published', true)
  .order('created_at', { ascending: false })

  return (
    <AgensiProfileClient 
      agency={agency} 
      packages={packages || []} 
      reviews={reviews || []}
      newsFeed={newsFeed || []}
      reels={reels || []}
      albums={albums || []}
    />
  )
}