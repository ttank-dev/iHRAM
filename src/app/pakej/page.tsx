import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PakejListingClient from './PakejListingClient'
import MobileNav from '@/app/MobileNav'
import Footer from '@/app/Footer'

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
        <PakejListingClient packages={packages || []} />
      </div>

      <Footer />
    </div>
  )
}