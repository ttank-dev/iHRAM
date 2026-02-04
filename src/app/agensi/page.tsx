import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
  const agencyRatings = new Map()
  reviews?.forEach(review => {
    if (!agencyRatings.has(review.agency_id)) {
      agencyRatings.set(review.agency_id, { total: 0, count: 0 })
    }
    const current = agencyRatings.get(review.agency_id)
    current.total += review.rating
    current.count += 1
  })

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh' }}>
      
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="/logo.png" 
              alt="iHRAM" 
              style={{ 
                height: '50px',
                filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%) drop-shadow(2px 2px 4px rgba(184,147,109,0.3))'
              }} 
            />
          </Link>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Home</Link>
            <Link href="/pakej" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Pakej Umrah</Link>
            <Link href="/agensi" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
            <Link href="/panduan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        padding: '80px 40px',
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
            Agensi
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Direktori agensi umrah berdaftar dan terpercaya di Malaysia
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '48px auto', padding: '0 40px' }}>
        
        {agencies && agencies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {agencies.map((agency) => {
              const ratingData = agencyRatings.get(agency.id)
              const avgRating = ratingData ? (ratingData.total / ratingData.count).toFixed(1) : null
              const reviewCount = ratingData ? ratingData.count : 0

              return (
                <Link 
                  key={agency.id}
                  href={`/agensi/${agency.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E5E5E0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    height: '100%',
                    transition: 'all 0.3s'
                  }}>
                    
                    {/* Cover Image */}
                    <div style={{ 
                      height: '120px',
                      backgroundImage: agency.cover_url ? `url(${agency.cover_url})` : 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {agency.is_verified && (
                        <div style={{ 
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          backgroundColor: '#B8936D',
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(184,147,109,0.4)'
                        }}>
                          ✓ VERIFIED
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '24px', position: 'relative', marginTop: '-40px' }}>
                      
                      {/* Logo */}
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        {agency.logo_url ? (
                          <img 
                            src={agency.logo_url}
                            alt={agency.name}
                            style={{ 
                              width: '80px',
                              height: '80px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                              border: '4px solid white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              backgroundColor: 'white'
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: '#B8936D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            {agency.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Agency Name */}
                      <h3 style={{ 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#2C2C2C',
                        marginBottom: '12px',
                        textAlign: 'center',
                        lineHeight: '1.3'
                      }}>
                        {agency.name}
                      </h3>

                      {/* Rating Display */}
                      {avgRating ? (
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star}
                                style={{ 
                                  fontSize: '16px',
                                  color: star <= Math.round(parseFloat(avgRating)) ? '#B8936D' : '#E5E5E0'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#B8936D' }}>
                            {avgRating}
                          </span>
                          <span style={{ fontSize: '14px', color: '#999' }}>
                            ({reviewCount} ulasan)
                          </span>
                        </div>
                      ) : (
                        <div style={{ 
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#999',
                          marginBottom: '16px'
                        }}>
                          Tiada ulasan lagi
                        </div>
                      )}

                      {/* About */}
                      {agency.about && (
                        <p style={{ 
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          textAlign: 'center',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {agency.about}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div style={{ 
                        paddingTop: '16px',
                        borderTop: '1px solid #F5F5F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {agency.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                            <span>📞</span>
                            <span>{agency.phone}</span>
                          </div>
                        )}
                        {agency.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                            <span>📧</span>
                            <span>{agency.email}</span>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <div style={{ 
                        marginTop: '20px',
                        padding: '12px',
                        backgroundColor: '#F5F5F0',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#B8936D',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Lihat Profil →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            border: '1px solid #E5E5E0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏢</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
              Tiada Agensi
            </h3>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Belum ada agensi berdaftar pada masa ini
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px', marginTop: '100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', marginBottom: '40px' }}>
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/logo.png" 
                  alt="iHRAM" 
                  style={{ 
                    height: '50px',
                    filter: 'brightness(0) invert(1)'
                  }} 
                />
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam mencari pakej yang sesuai.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Pautan Pantas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Home</Link>
                <Link href="/pakej" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Pakej Umrah</Link>
                <Link href="/agensi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Agensi</Link>
                <Link href="/panduan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Panduan</Link>
                <Link href="/ulasan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Ulasan</Link>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Hubungi Kami
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>
                <div>📧 info@ihram.com.my</div>
                <div>📞 +60 12-345 6789</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            <p>© 2026 iHRAM - Think Tank Sdn Bhd</p>
          </div>
        </div>
      </footer>
    </div>
  )
}