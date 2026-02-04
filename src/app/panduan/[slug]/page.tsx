import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function PanduanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch guide details
  const { data: guide } = await supabase
    .from('guides')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!guide) {
    notFound()
  }

  // Fetch related guides (same category)
  const { data: relatedGuides } = await supabase
    .from('guides')
    .select('*')
    .eq('category', guide.category)
    .eq('is_published', true)
    .neq('id', guide.id)
    .limit(3)

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ms-MY', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

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
            <Link href="/panduan" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
            <Link href="/" style={{ color: '#B8936D', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
            <span>/</span>
            <Link href="/panduan" style={{ color: '#B8936D', textDecoration: 'none', fontWeight: '500' }}>Panduan</Link>
            <span>/</span>
            <span style={{ color: '#2C2C2C' }}>{guide.title}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: '900px', margin: '48px auto', padding: '0 40px' }}>
        
        {/* Article Card */}
        <article style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E5E5E0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          marginBottom: '48px'
        }}>
          
          {/* Cover Image */}
          {guide.cover_image && (
            <img 
              src={guide.cover_image}
              alt={guide.title}
              style={{ 
                width: '100%',
                height: '400px',
                objectFit: 'cover'
              }}
            />
          )}

          <div style={{ padding: '48px' }}>
            
            {/* Category & Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              {guide.category && (
                <span style={{ 
                  padding: '8px 20px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  borderRadius: '50px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {guide.category}
                </span>
              )}
              <span style={{ fontSize: '14px', color: '#999' }}>
                📅 {formatDate(guide.created_at)}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ 
              fontSize: '40px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '24px',
              lineHeight: '1.3',
              fontFamily: 'Georgia, serif'
            }}>
              {guide.title}
            </h1>

            {/* Excerpt */}
            {guide.excerpt && (
              <p style={{ 
                fontSize: '18px',
                color: '#666',
                lineHeight: '1.8',
                marginBottom: '32px',
                paddingBottom: '32px',
                borderBottom: '2px solid #F5F5F0'
              }}>
                {guide.excerpt}
              </p>
            )}

            {/* Content */}
            <div 
              style={{ 
                fontSize: '17px',
                lineHeight: '1.9',
                color: '#4A4A4A'
              }}
              dangerouslySetInnerHTML={{ __html: guide.content || '' }}
            />

            {/* CTA */}
            <div style={{ 
              marginTop: '48px',
              padding: '32px',
              backgroundColor: '#FFF8F0',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '16px',
                fontFamily: 'Georgia, serif'
              }}>
                Sudah Bersedia Untuk Umrah?
              </h3>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                Terokai pakej umrah yang sesuai dengan keperluan anda
              </p>
              <Link 
                href="/pakej"
                style={{ 
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  borderRadius: '50px',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Lihat Pakej Umrah
              </Link>
            </div>
          </div>
        </article>

        {/* Related Guides */}
        {relatedGuides && relatedGuides.length > 0 && (
          <div>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '24px',
              fontFamily: 'Georgia, serif'
            }}>
              Panduan Berkaitan
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {relatedGuides.map((relGuide) => (
                <Link 
                  key={relGuide.id}
                  href={`/panduan/${relGuide.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #E5E5E0',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s'
                  }}>
                    {relGuide.cover_image ? (
                      <div style={{ 
                        height: '140px',
                        backgroundImage: `url(${relGuide.cover_image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    ) : (
                      <div style={{ 
                        height: '140px',
                        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px'
                      }}>
                        📚
                      </div>
                    )}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ 
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#2C2C2C',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                      }}>
                        {relGuide.title}
                      </h3>
                      <div style={{ 
                        color: '#B8936D',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        Baca →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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