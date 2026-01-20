import { createClient } from '@/lib/supabase/server'
import ReviewForm from './ReviewForm'

export default async function HantarUlasanPage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const { data: packages } = await supabase
    .from('packages')
    .select('id, title, agency_id, departure_dates')
    .eq('status', 'published')
    .order('title')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>
          Hantar Ulasan
        </h1>
        <p style={{ color: '#A0A0A0', marginBottom: '32px', fontSize: '16px' }}>
          Kongsi pengalaman umrah anda untuk bantu jemaah lain
        </p>

        <ReviewForm agencies={agencies || []} packages={packages || []} />
      </div>
    </div>
  )
}