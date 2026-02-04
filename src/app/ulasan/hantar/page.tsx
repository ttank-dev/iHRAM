import { createClient } from '@/lib/supabase/server'
import HantarUlasanClient from './HantarUlasanClient'

export default async function HantarUlasanPage() {
  const supabase = await createClient()

  // Fetch agencies server-side
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })

  return <HantarUlasanClient agencies={agencies || []} />
}