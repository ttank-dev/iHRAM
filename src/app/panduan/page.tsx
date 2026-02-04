import { createClient } from '@/lib/supabase/server'
import PanduanClient from './PanduanClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PanduanPage() {
  const supabase = await createClient()
  
  // Fetch all published guides
  const { data: guides } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // Fetch active categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Extract category names for filter buttons
  const categoryNames = categoriesData?.map(cat => cat.name) || []

  return <PanduanClient guides={guides || []} categories={categoryNames} />
}