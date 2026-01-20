import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UlasanPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, agencies(name, slug), packages(title, slug)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>Ulasan Jemaah</h1>
            <p style={{ color: '#A0A0A0', fontSize: '16px' }}>{reviews?.length || 0} ulasan dari jemaah yang telah menggunakan perkhidmatan agensi</p>
          </div>
          <Link href="/ulasan/hantar" style={{ padding: '12px 24px', backgroundColor: '#D4AF37', color: 'black', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px' }}>✍️ Hantar Ulasan</Link>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {reviews?.map((review: any) => (
            <div key={review.id} style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '4px' }}>{review.reviewer_name || 'Anonymous'}</p>
                  <Link href={`/agensi/${review.agencies?.slug}`} style={{ color: '#D4AF37', fontSize: '14px', textDecoration: 'none' }}>{review.agencies?.name}</Link>
                  {review.packages && (
                    <>
                      <span style={{ color: '#666', margin: '0 8px' }}>•</span>
                      <Link href={`/pakej/${review.packages.slug}`} style={{ color: '#A0A0A0', fontSize: '14px', textDecoration: 'none' }}>{review.packages.title}</Link>
                    </>
                  )}
                  <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{new Date(review.created_at).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < review.rating ? '#D4AF37' : '#2A2A2A', fontSize: '20px' }}>★</span>
                  ))}
                </div>
              </div>

              <p style={{ color: '#E5E5E5', lineHeight: '1.7', marginBottom: '16px' }}>{review.review_text}</p>

              {review.travel_date && (
                <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '16px' }}>📅 Travel: {review.travel_date}</p>
              )}

              {review.photos && review.photos.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {review.photos.map((photoUrl: string, index: number) => (
                      <a key={index} href={photoUrl} target="_blank" rel="noopener noreferrer">
                        <img src={photoUrl} alt={`Review photo ${index + 1}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #2A2A2A', cursor: 'pointer' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {review.is_verified && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2A2A2A' }}>
                  <span style={{ padding: '4px 12px', backgroundColor: '#10B981', color: 'white', borderRadius: '999px', fontSize: '12px' }}>✓ Verified Jemaah</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {(!reviews || reviews.length === 0) && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ color: '#A0A0A0', fontSize: '18px', marginBottom: '16px' }}>Belum ada ulasan lagi</p>
            <Link href="/ulasan/hantar" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#D4AF37', color: 'black', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>Jadilah yang pertama untuk mengulas!</Link>
          </div>
        )}
      </div>
    </div>
  )
}