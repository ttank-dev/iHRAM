import { createClient } from '@/lib/supabase/server'
import AgensiClient from './AgensiClient'

export default async function AgensiPage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('*')
    .eq('is_active', true)
    .order('is_verified', { ascending: false })
    .order('name', { ascending: true })

  // Get reviews for all agencies
  const { data: reviews } = await supabase
    .from('reviews')
    .select('agency_id, rating')
    .eq('is_approved', true)

  // Calculate ratings for each agency
  const agencyRatings: Record<string, { total: number; count: number }> = {}
  
  reviews?.forEach(review => {
    if (!agencyRatings[review.agency_id]) {
      agencyRatings[review.agency_id] = { total: 0, count: 0 }
    }
    agencyRatings[review.agency_id].total += review.rating
    agencyRatings[review.agency_id].count += 1
  })

  return <AgensiClient agencies={agencies || []} ratings={agencyRatings} />
}