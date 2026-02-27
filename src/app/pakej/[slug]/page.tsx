import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MobileNav from '@/app/MobileNav'

export default async function PakejDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: packageData } = await supabase
    .from('packages')
    .select('*, agencies(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!packageData) {
    notFound()
  }

  const pkg = packageData
  const phone = pkg.agencies?.phone || ''
  const waNumber = phone.replace(/\D/g, '').replace(/^0/, '60')
  const waMessage = `Salam, saya berminat dengan pakej ${pkg.title} dari iHRAM`
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = String(d.getFullYear())
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh' }}>

      <style>{`
        .pd-nav-inner { position: relative; }
        .pd-breadcrumb { padding: 16px 40px; }
        .pd-main { max-width: 1400px; margin: 48px auto; padding: 0 40px; }
        .pd-grid { display: grid; grid-template-columns: 1.8fr 1fr; gap: 48px; }
        .pd-hero-img { height: 480px; }
        .pd-meta-grid-1 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .pd-meta-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 2px solid #F5F5F0; }
        .pd-footer-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 60px; margin-bottom: 40px; }
        .pd-sticky { position: sticky; top: 120px; }

        @media (max-width: 1023px) {
          .pd-grid { grid-template-columns: 1fr; gap: 32px; }
          .pd-sticky { position: static; }
          .pd-main { padding: 0 24px; margin: 32px auto; }
          .pd-breadcrumb { padding: 16px 24px; }
          .pd-hero-img { height: 320px !important; }
          .pd-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }

        @media (max-width: 639px) {
          .pd-grid { gap: 20px; }
          .pd-main { padding: 0 16px; margin: 20px auto; }
          .pd-breadcrumb { padding: 12px 16px; font-size: 13px !important; }
          .pd-hero-img { height: 220px !important; }
          .pd-meta-grid-1 { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .pd-meta-grid-1 > div { padding: 12px 8px !important; }
          .pd-meta-grid-1 > div > div:last-child { font-size: 15px !important; }
          .pd-meta-grid-2 { grid-template-columns: 1fr; gap: 12px; }
          .pd-footer-grid { grid-template-columns: 1fr; gap: 24px; }
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

      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0' }}>
        <div className="pd-breadcrumb" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
            <Link href="/" style={{ color: '#B8936D', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span>/</span>
            <Link href="/pakej" style={{ color: '#B8936D', textDecoration: 'none', fontWeight: '500' }}>Pakej Umrah</Link>
            <span>/</span>
            <span style={{ color: '#2C2C2C' }}>{pkg.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pd-main">
        <div className="pd-grid">
          
          {/* Left Column */}
          <div>
            
            {/* Hero Image */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #E5E5E0' }}>
              {pkg.photos && pkg.photos[0] ? (
                <div className="pd-hero-img" style={{ position: 'relative', backgroundImage: `url(${pkg.photos[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {pkg.agencies?.is_verified && (
                    <div style={{ position: 'absolute', top: '24px', left: '24px', backgroundColor: '#B8936D', color: 'white', padding: '10px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(184,147,109,0.4)' }}>
                      ✅ VERIFIED AGENCY
                    </div>
                  )}
                </div>
              ) : (
                <div className="pd-hero-img" style={{ backgroundColor: '#E5E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontSize: '64px', opacity: 0.5 }}>📷</span>
                  <span style={{ fontSize: '16px', color: '#999' }}>Tiada Gambar</span>
                </div>
              )}
            </div>

            {/* Package Details Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', border: '1px solid #E5E5E0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              
              {/* Title */}
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '32px', fontFamily: 'Georgia, serif', lineHeight: '1.2' }}>
                {pkg.title}
              </h1>

              {/* Meta Info Grid - Row 1 */}
              <div className="pd-meta-grid-1">
                <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>JENIS PAKEJ</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#B8936D', textTransform: 'capitalize' }}>
                    {pkg.package_type || 'Standard'}
                  </div>
                </div>
                
                {pkg.duration_nights && (
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TEMPOH</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#B8936D' }}>{pkg.duration_nights} Malam</div>
                  </div>
                )}
                
                {pkg.departure_city && (
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BERLEPAS DARI</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#B8936D' }}>{pkg.departure_city}</div>
                  </div>
                )}
              </div>

              {/* Meta Info Grid - Row 2 */}
              <div className="pd-meta-grid-2">
                {pkg.departure_dates && pkg.departure_dates.length > 0 && (
                  <div style={{ padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>TARIKH BERLEPAS</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {pkg.departure_dates.slice(0, 3).map((date: string, i: number) => (
                        <div key={i} style={{ padding: '6px 12px', backgroundColor: '#B8936D', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                          {formatDate(date)}
                        </div>
                      ))}
                      {pkg.departure_dates.length > 3 && (
                        <div style={{ padding: '6px 12px', backgroundColor: '#B8936D', color: 'white', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                          +{pkg.departure_dates.length - 3} lagi
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {pkg.quota && (
                  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KUOTA TERSEDIA</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#B8936D' }}>
                      {pkg.quota} <span style={{ fontSize: '16px', color: '#666', fontWeight: '500' }}>seats</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {pkg.description && (
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                    Penerangan Pakej
                  </h2>
                  <p style={{ fontSize: '16px', lineHeight: '1.9', color: '#4A4A4A', whiteSpace: 'pre-wrap' }}>
                    {pkg.description}
                  </p>
                </div>
              )}

              {/* Itinerary */}
              {pkg.itinerary && (
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                    📋 Itinerari Perjalanan
                  </h2>
                  <div style={{ padding: '24px', backgroundColor: '#F5F5F0', borderRadius: '12px', borderLeft: '4px solid #B8936D' }}>
                    <p style={{ fontSize: '16px', lineHeight: '1.9', color: '#4A4A4A', whiteSpace: 'pre-wrap' }}>
                      {pkg.itinerary}
                    </p>
                  </div>
                </div>
              )}

              {/* Inclusions */}
              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                    ✓ Termasuk Dalam Pakej
                  </h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {pkg.inclusions.map((item: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#F5F5F0', borderRadius: '10px', alignItems: 'start' }}>
                        <span style={{ color: '#B8936D', fontSize: '20px', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: '16px', color: '#2C2C2C', lineHeight: '1.6' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exclusions */}
              {pkg.exclusions && pkg.exclusions.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                    ✗ Tidak Termasuk
                  </h2>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {pkg.exclusions.map((item: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#FFF8F0', borderRadius: '10px', border: '1px solid #FFE8D0', alignItems: 'start' }}>
                        <span style={{ color: '#999', fontSize: '20px', flexShrink: 0 }}>✗</span>
                        <span style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div>
            <div className="pd-sticky">
              
              {/* Price Card */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                
                {/* Main Price */}
                <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '2px solid #F5F5F0', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HARGA BERMULA DARI</div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#B8936D', fontFamily: 'Georgia, serif', lineHeight: '1', marginBottom: '8px' }}>
                    RM {pkg.price_quad?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>per orang (Quad Sharing)</div>
                </div>

                {/* Other Prices */}
                {(pkg.price_triple || pkg.price_double || pkg.price_child) && (
                  <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '2px solid #F5F5F0' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PILIHAN HARGA LAIN</div>
                    {pkg.price_triple && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '12px', backgroundColor: '#F5F5F0', borderRadius: '8px' }}>
                        <span style={{ color: '#666', fontSize: '15px' }}>Triple Sharing</span>
                        <span style={{ fontWeight: '700', color: '#2C2C2C', fontSize: '16px' }}>RM {pkg.price_triple.toLocaleString()}</span>
                      </div>
                    )}
                    {pkg.price_double && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '12px', backgroundColor: '#F5F5F0', borderRadius: '8px' }}>
                        <span style={{ color: '#666', fontSize: '15px' }}>Double Sharing</span>
                        <span style={{ fontWeight: '700', color: '#2C2C2C', fontSize: '16px' }}>RM {pkg.price_double.toLocaleString()}</span>
                      </div>
                    )}
                    {pkg.price_child && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F5F5F0', borderRadius: '8px' }}>
                        <span style={{ color: '#666', fontSize: '15px' }}>Kanak-kanak</span>
                        <span style={{ fontWeight: '700', color: '#2C2C2C', fontSize: '16px' }}>RM {pkg.price_child.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* WhatsApp Button */}
                <Link 
                  href={waLink} 
                  target="_blank"
                  style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#25D366',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '15px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>

                </Link>
              </div>

              {/* Agency Card */}
              {pkg.agencies && (
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #E5E5E0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DISEDIAKAN OLEH</div>
                  
                  <Link href={`/agensi/${pkg.agencies.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: '#F5F5F0', borderRadius: '12px', transition: 'background-color 0.2s' }}>
                      {pkg.agencies.logo_url ? (
                        <img src={pkg.agencies.logo_url} alt={pkg.agencies.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#B8936D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '24px', boxShadow: '0 2px 8px rgba(184,147,109,0.3)' }}>
                          {pkg.agencies.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#2C2C2C', fontSize: '17px', marginBottom: '4px' }}>{pkg.agencies.name}</div>
                        {pkg.agencies.is_verified && (
                          <div style={{ fontSize: '13px', color: '#B8936D', fontWeight: '600' }}>✓ Verified Agency</div>
                        )}
                      </div>
                    </div>
                  </Link>

                  {(pkg.agencies.email || pkg.agencies.phone) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pkg.agencies.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#666' }}>
                          <span style={{ fontSize: '18px' }}>📧</span>
                          <span>{pkg.agencies.email}</span>
                        </div>
                      )}
                      {pkg.agencies.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#666' }}>
                          <span style={{ fontSize: '18px' }}>📞</span>
                          <span>{pkg.agencies.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="pd-footer-grid">
            
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