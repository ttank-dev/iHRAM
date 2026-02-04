import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function UlasanPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, agencies(*), packages(*)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

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
            <Link href="/agensi" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
            <Link href="/panduan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
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
            Ulasan
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '700px',
            margin: '0 auto 32px'
          }}>
            Pengalaman sebenar dari jemaah yang telah menggunakan perkhidmatan agensi
          </p>
          <Link 
            href="/ulasan/hantar"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              backgroundColor: 'white',
              color: '#B8936D',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            <span>✍️</span>
            <span>Tulis Ulasan</span>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '48px auto', padding: '0 40px' }}>
        
        {reviews && reviews.length > 0 ? (
          <div style={{ display: 'grid', gap: '24px' }}>
            {reviews.map((review) => (
              <div 
                key={review.id}
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  border: '1px solid #E5E5E0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  
                  <div style={{ flex: 1 }}>
                    {/* Reviewer Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ 
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#B8936D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                          {review.reviewer_name || 'Anonymous'}
                        </div>
                        {review.travel_date && (
                          <div style={{ fontSize: '14px', color: '#999' }}>
                            Perjalanan: {review.travel_date}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          style={{ 
                            fontSize: '20px',
                            color: star <= review.rating ? '#B8936D' : '#E5E5E0'
                          }}
                        >
                          ★
                        </span>
                      ))}
                      <span style={{ marginLeft: '8px', fontSize: '16px', fontWeight: '600', color: '#B8936D' }}>
                        {review.rating}.0
                      </span>
                    </div>

                    {/* Review Text */}
                    <p style={{ 
                      fontSize: '16px',
                      lineHeight: '1.8',
                      color: '#4A4A4A',
                      marginBottom: '20px'
                    }}>
                      {review.review_text}
                    </p>

                    {/* Package & Agency Info */}
                    <div style={{ display: 'flex', gap: '24px', paddingTop: '20px', borderTop: '1px solid #F5F5F0' }}>
                      {review.agencies && (
                        <Link 
                          href={`/agensi/${review.agencies.slug}`}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none'
                          }}
                        >
                          {review.agencies.logo_url ? (
                            <img 
                              src={review.agencies.logo_url}
                              alt={review.agencies.name}
                              style={{ 
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{ 
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              backgroundColor: '#B8936D',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              {review.agencies.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '13px', color: '#999' }}>Agensi</div>
                            <div style={{ fontSize: '14px', color: '#2C2C2C', fontWeight: '600' }}>
                              {review.agencies.name}
                            </div>
                          </div>
                        </Link>
                      )}

                      {review.packages && (
                        <Link 
                          href={`/pakej/${review.packages.slug}`}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none'
                          }}
                        >
                          <div style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: '#F5F5F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                          }}>
                            📦
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', color: '#999' }}>Pakej</div>
                            <div style={{ fontSize: '14px', color: '#2C2C2C', fontWeight: '600' }}>
                              {review.packages.title}
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Verified Badge */}
                  {review.is_verified && (
                    <div style={{ 
                      padding: '6px 14px',
                      backgroundColor: '#F5F5F0',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#B8936D'
                    }}>
                      ✓ Verified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            border: '1px solid #E5E5E0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
              Belum Ada Ulasan
            </h3>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              Jadilah yang pertama untuk berkongsi pengalaman anda
            </p>
            <Link 
              href="/ulasan/hantar"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                backgroundColor: '#B8936D',
                color: 'white',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <span>✍️</span>
              <span>Tulis Ulasan</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', marginBottom: '40px' }}>
            
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