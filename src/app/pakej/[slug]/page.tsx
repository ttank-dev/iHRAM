'use client'

import Footer from '@/app/Footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PakejDetailNavbar from './PakejDetailNavbar'

export default function PakejDetail() {
  const params = useParams()
  const slug = params.slug as string
  const [pkg, setPkg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackage = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('packages')
        .select('*, agencies(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      
      if (!data) {
        window.location.href = '/404'
        return
      }
      setPkg(data)
      setLoading(false)
    }
    fetchPackage()
  }, [slug])

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PakejDetailNavbar />
        <div style={{ textAlign: 'center', color: '#B8936D', fontSize: '18px' }}>Memuatkan...</div>
      </div>
    )
  }

  if (!pkg) return null

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


      
      {/* Navigation */}
      <PakejDetailNavbar />

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
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '32px', fontFamily: 'Arial Rounded MT Bold', lineHeight: '1.2' }}>
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
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Arial Rounded MT Bold' }}>
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
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Arial Rounded MT Bold' }}>
                    Itinerari Perjalanan
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
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Arial Rounded MT Bold' }}>
                    Termasuk Dalam Pakej
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
                  <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '20px', fontFamily: 'Arial Rounded MT Bold' }}>
                    Tidak Termasuk
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

      <Footer />
    </div>
  )
}