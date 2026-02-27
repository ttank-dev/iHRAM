import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PakejListingClient from './PakejListingClient'
import MobileNav from '@/app/MobileNav'

export default async function PakejPage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('packages')
    .select(`
      *,
      agencies!inner (
        id,
        name,
        slug,
        is_active,
        is_verified
      )
    `)
    .eq('status', 'published')
    .eq('agencies.is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F0' }}>

      <style>{`
        .pk-nav-inner { position: relative; }
        .pk-hero { padding: 80px 40px; }
        .pk-hero h1 { font-size: 48px; }
        .pk-hero p { font-size: 18px; }
        .pk-content { max-width: 1400px; margin: 0 auto; padding: 60px 40px; }
        .pk-footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-bottom: 40px; }

        @media (max-width: 1023px) {
          .pk-hero { padding: 60px 24px; }
          .pk-hero h1 { font-size: 36px !important; }
          .pk-content { padding: 40px 24px; }
          .pk-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }

        @media (max-width: 639px) {
          .pk-hero { padding: 40px 16px; }
          .pk-hero h1 { font-size: 28px !important; margin-bottom: 12px !important; }
          .pk-hero p { font-size: 15px !important; }
          .pk-content { padding: 24px 16px; }
          .pk-footer-grid { grid-template-columns: 1fr; gap: 24px; }
          footer { padding: 32px 16px 16px !important; }
        }
      `}</style>


      
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="hp-nav-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="iHRAM"
              className="hp-logo-img"
              style={{
                height: '50px',
                filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%) drop-shadow(2px 2px 4px rgba(184,147,109,0.3))'
              }}
            />
          </Link>
          <div className="hp-desktop-links" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Home</Link>
            <Link href="/pakej" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Pakej Umrah</Link>
            <Link href="/agensi" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
            <Link href="/panduan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pk-hero" style={{ 
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif'
          }}>
            Pakej Umrah
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Pilih pakej umrah yang sesuai dengan keperluan anda.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="pk-content">
      
        {/* Client Component with Filters */}
        <PakejListingClient packages={packages || []} />
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="pk-footer-grid">
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/logo.png" 
                  alt="iHRAM" 
                  style={{ 
                    height: '50px',
                    filter: 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(255,255,255,0.2))'
                  }} 
                />
              </div>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam mencari pakej yang sesuai dengan keperluan mereka.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Pautan Pantas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Home</Link>
                <Link href="/pakej" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Pakej Umrah</Link>
                <Link href="/agensi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Agensi</Link>
                <Link href="/panduan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Panduan</Link>
                <Link href="/ulasan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Ulasan</Link>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Hubungi Kami
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
                <div>
                  <strong>Email:</strong><br/>
                  info@ihram.com.my
                </div>
                <div>
                  <strong>WhatsApp:</strong><br/>
                  +60 12-345 6789
                </div>
                <div>
                  <strong>Waktu Operasi:</strong><br/>
                  Isnin - Jumaat: 9:00 AM - 6:00 PM
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            <p>© 2026 iHRAM - Think Tank Sdn Bhd. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}