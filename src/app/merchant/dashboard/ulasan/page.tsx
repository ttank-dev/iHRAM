'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UlasanPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { init() }, [])

  const init = async () => {
    const res = await fetch('/api/merchant/me')
    if (!res.ok) { router.push('/merchant/login'); return }
    const data = await res.json()
    if (!data.agencyId) { router.push('/merchant/login'); return }
    setAgencyId(data.agencyId)
    await loadReviews(data.agencyId)
  }

  const loadReviews = async (aid: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*, packages(title, slug)')
      .eq('agency_id', aid)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  const filteredReviews = filter === 'approved' ? reviews.filter(r => r.is_approved)
    : filter === 'pending' ? reviews.filter(r => !r.is_approved)
    : reviews

  const approvedCount = reviews.filter(r => r.is_approved).length
  const pendingCount = reviews.filter(r => !r.is_approved).length

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
      <div style={{ fontSize: '16px', color: '#666' }}>Loading reviews...</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>Ulasan</h1>
        <p style={{ fontSize: '15px', color: '#666' }}>Semua ulasan dari jemaah untuk agensi anda</p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '8px', display: 'inline-flex', gap: '8px', marginBottom: '24px', border: '1px solid #E5E5E0' }}>
        {(['all', 'approved', 'pending'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '10px 20px', backgroundColor: filter === f ? '#B8936D' : 'transparent',
            color: filter === f ? 'white' : '#666', border: 'none', borderRadius: '8px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}>
            {f === 'all' ? `Semua (${reviews.length})` : f === 'approved' ? `Approved (${approvedCount})` : `Pending (${pendingCount})`}
          </button>
        ))}
      </div>

      {filteredReviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReviews.map((review) => (
            <div key={review.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E5E0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#2C2C2C' }}>{review.reviewer_name || 'Anonymous'}</div>
                    <div>{'⭐'.repeat(review.rating)}<span style={{ fontSize: '14px', color: '#666', marginLeft: '4px' }}>({review.rating}/5)</span></div>
                  </div>
                  {review.packages && (
                    <Link href={`/pakej/${review.packages.slug}`} target="_blank" style={{ fontSize: '14px', color: '#B8936D', textDecoration: 'none', fontWeight: '600' }}>
                      📦 {review.packages.title}
                    </Link>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: review.is_approved ? '#E8F5E9' : '#FFF8E1', color: review.is_approved ? '#2E7D32' : '#F57C00' }}>
                    {review.is_approved ? 'APPROVED' : 'PENDING'}
                  </div>
                  {review.is_verified && (
                    <div style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: '#E3F2FD', color: '#1976D2' }}>✓ VERIFIED</div>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: '1.6', marginBottom: '12px' }}>{review.review_text}</p>
              {review.photos && review.photos.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {review.photos.map((photo: string, index: number) => (
                    <img key={index} src={photo} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E5E5E0' }} />
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E5E5E0', fontSize: '13px', color: '#999' }}>
                <div>
                  <span>📅 Travel: {review.travel_date}</span>
                  <span style={{ margin: '0 8px' }}>•</span>
                  <span>🕐 Posted: {new Date(review.created_at).toLocaleDateString('ms-MY')}</span>
                </div>
                {review.reviewer_email && <div>📧 {review.reviewer_email}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⭐</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            {filter === 'all' ? 'Tiada Ulasan Lagi' : filter === 'approved' ? 'Tiada Ulasan Approved' : 'Tiada Ulasan Pending'}
          </h3>
          <p style={{ fontSize: '16px', color: '#666' }}>Ulasan dari jemaah akan muncul di sini</p>
        </div>
      )}
    </div>
  )
}