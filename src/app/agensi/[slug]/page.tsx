import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AgencyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!agency) {
    notFound()
  }

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <Link href="/agensi" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '14px', marginBottom: '24px', display: 'inline-block' }}>← Kembali ke Senarai Agensi</Link>

        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '24px' }}>
            {agency.logo_url && (
              <img src={agency.logo_url} alt={agency.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #2A2A2A' }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>{agency.name}</h1>
                {agency.is_verified && (
                  <span style={{ padding: '4px 12px', backgroundColor: '#10B981', color: 'white', borderRadius: '999px', fontSize: '12px' }}>✓ Verified</span>
                )}
              </div>

              {reviews && reviews.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ color: i < Math.round(averageRating) ? '#D4AF37' : '#2A2A2A', fontSize: '24px' }}>★</span>
                    ))}
                  </div>
                  <span style={{ color: '#E5E5E5', fontSize: '18px', fontWeight: '600' }}>{averageRating.toFixed(1)}</span>
                  <span style={{ color: '#A0A0A0', fontSize: '14px' }}>({reviews.length} ulasan)</span>
                </div>
              )}

              {agency.about && (
                <p style={{ color: '#E5E5E5', lineHeight: '1.7', marginBottom: '16px' }}>{agency.about}</p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#A0A0A0', fontSize: '14px' }}>
                {agency.phone && <span>📞 {agency.phone}</span>}
                {agency.email && <span>✉️ {agency.email}</span>}
                {agency.website && (
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', textDecoration: 'none' }}>🌐 Website</a>
                )}
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Pakej dari {agency.name}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {packages?.map((pkg: any) => (
            <Link key={pkg.id} href={`/pakej/${pkg.slug}`} style={{ textDecoration: 'none', backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>{pkg.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#A0A0A0', fontSize: '12px' }}>Dari</p>
                    <p style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 'bold' }}>RM{pkg.price_quad?.toLocaleString() || '0'}</p>
                  </div>
                  <span style={{ color: '#D4AF37', fontSize: '14px' }}>Lihat Detail →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {reviews && reviews.length > 0 && (
          <>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Ulasan Jemaah</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{review.reviewer_name || 'Anonymous'}</p>
                      <p style={{ color: '#666', fontSize: '12px' }}>{new Date(review.created_at).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#D4AF37' : '#2A2A2A', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#E5E5E5', lineHeight: '1.6', marginBottom: '16px' }}>{review.review_text}</p>
                  
                  {review.photos && review.photos.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginTop: '16px' }}>
                      {review.photos.map((photoUrl: string, index: number) => (
                        <a key={index} href={photoUrl} target="_blank" rel="noopener noreferrer">
                          <img src={photoUrl} alt={`Review photo ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #2A2A2A', cursor: 'pointer' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {reviews.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link href="/ulasan" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '16px' }}>Lihat semua {reviews.length} ulasan →</Link>
              </div>
            )}
          </>
        )}

        {(!reviews || reviews.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px' }}>
            <p style={{ color: '#A0A0A0', marginBottom: '16px' }}>Belum ada ulasan untuk agensi ini</p>
            <Link href="/ulasan/hantar" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#D4AF37', color: 'black', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>Hantar Ulasan Pertama</Link>
          </div>
        )}
      </div>
    </div>
  )
}