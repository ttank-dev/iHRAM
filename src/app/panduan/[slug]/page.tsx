import Footer from '@/app/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PanduanDetailNavbar from './PanduanDetailNavbar'

export default async function PanduanDetail({ params }: { params: Promise<{ slug: string }> }) {
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
      <PanduanDetailNavbar />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0' }}>
        <div className="pd2-breadcrumb" style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px' }}>
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
      <div className="pd2-main" style={{ maxWidth: '900px', margin: '48px auto', padding: '0 40px' }}>
        
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
              className="pd2-cover"
              style={{ 
                width: '100%',
                height: '400px',
                objectFit: 'cover'
              }}
            />
          )}

          <div className="pd2-article-inner" style={{ padding: '48px' }}>
            
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
            <h1 className="pd2-title" style={{ 
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

            <div className="pd2-related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
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

      <Footer />
    </div>
  )
}