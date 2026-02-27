import Footer from '@/app/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UlasanNavbar from './UlasanNavbar'
import UlasanClient from './UlasanClient'

export default async function UlasanPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, agencies(*), packages(*)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh' }}>

      <UlasanNavbar />

      {/* Hero Section */}
      <section className="ul-hero" style={{ background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 className="ul-hero-title" style={{ fontWeight: 'bold', color: 'white', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
            Ulasan
          </h1>
          <p className="ul-hero-sub" style={{ color: 'rgba(255,255,255,0.95)', maxWidth: '700px', margin: '0 auto 32px' }}>
            Pengalaman sebenar dari jemaah yang telah menggunakan perkhidmatan agensi
          </p>
          <Link
            href="/ulasan/hantar"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', backgroundColor: 'white', color: '#B8936D', borderRadius: '10px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
          >
            <span>&#9997;&#65039;</span>
            <span>Tulis Ulasan</span>
          </Link>
        </div>
      </section>

      {/* Reviews - Client Component */}
      <UlasanClient reviews={reviews || []} />

      <Footer />
    </div>
  )
}