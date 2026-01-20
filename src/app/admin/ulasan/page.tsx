import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import ReviewButtons from './ReviewButtons'
import ReviewImage from './ReviewImage'

export default async function AdminUlasanPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, agencies(name), packages(title)')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  return (
    <div style={{ color: 'white' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Approve Ulasan</h1>
      <p style={{ color: '#A0A0A0', marginBottom: '32px' }}>{reviews?.length || 0} ulasan menunggu approval</p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {reviews?.map((review: any) => (
          <div key={review.id} style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{review.reviewer_name || 'Anonymous'}</p>
                <p style={{ color: '#A0A0A0', fontSize: '14px' }}>
                  {review.agencies?.name} {review.packages?.title && `- ${review.packages.title}`}
                </p>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  {new Date(review.created_at).toLocaleDateString('ms-MY', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                {review.reviewer_email && (
                  <p style={{ color: '#666', fontSize: '12px' }}>
                    📧 {review.reviewer_email}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < review.rating ? '#D4AF37' : '#2A2A2A', fontSize: '20px' }}>★</span>
                ))}
              </div>
            </div>

            <p style={{ color: '#E5E5E5', marginBottom: '16px', lineHeight: '1.6' }}>{review.review_text}</p>
            
            {review.travel_date && (
              <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '16px' }}>
                📅 Travel Date: {review.travel_date}
              </p>
            )}

            {review.photos && review.photos.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                  📸 Gambar ({review.photos.length}):
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                  {review.photos.map((photoUrl: string, index: number) => (
                    <div key={index}>
                      <ReviewImage src={photoUrl} alt={`Review photo ${index + 1}`} />
                    </div>
                  ))}
                </div>
                <p style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
                  Click gambar untuk view full size
                </p>
              </div>
            )}

            <ReviewButtons reviewId={review.id} />
          </div>
        ))}
        
        {(!reviews || reviews.length === 0) && (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <p style={{ color: '#A0A0A0', fontSize: '18px', marginBottom: '8px' }}>
              ✅ Tiada ulasan pending
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Semua ulasan telah diapprove atau ditolak
            </p>
          </div>
        )}
      </div>
    </div>
  )
}