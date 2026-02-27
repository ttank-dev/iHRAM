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

      {/* Footer */}
      <footer className="ul-footer" style={{ backgroundColor: '#B8936D', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="ul-footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', marginBottom: '40px' }}>
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img src="/logo.png" alt="iHRAM" style={{ height: '50px', filter: 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(255,255,255,0.2))' }} />
              </div>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam mencari pakej yang sesuai dengan keperluan mereka.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>Pautan Pantas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Home</Link>
                <Link href="/pakej" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Pakej Umrah</Link>
                <Link href="/agensi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Agensi</Link>
                <Link href="/panduan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Panduan</Link>
                <Link href="/ulasan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Ulasan</Link>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>Hubungi Kami</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
                <div><strong>Email:</strong><br/>info@ihram.com.my</div>
                <div><strong>WhatsApp:</strong><br/>+60 12-345 6789</div>
                <div><strong>Waktu Operasi:</strong><br/>Isnin - Jumaat: 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            <p>&#169; 2026 iHRAM - Think Tank Sdn Bhd. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}