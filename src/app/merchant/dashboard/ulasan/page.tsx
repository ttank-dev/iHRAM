'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Pagination from '@/app/Pagination'

const ITEMS_PER_PAGE = 10

export default function UlasanPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { init() }, [])
  useEffect(() => { setCurrentPage(1) }, [filter])

  const init = async () => {
    const res = await fetch('/api/merchant/me')
    if (!res.ok) { router.push('/merchant/login'); return }
    const data = await res.json()
    if (!data.agencyId) { router.push('/merchant/login'); return }
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

  const filtered = filter === 'approved' ? reviews.filter(r => r.is_approved)
    : filter === 'pending' ? reviews.filter(r => !r.is_approved)
    : reviews

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total:    reviews.length,
    approved: reviews.filter(r => r.is_approved).length,
    pending:  reviews.filter(r => !r.is_approved).length,
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  if (loading) return (
    <>
      <div className="ur-load"><div className="ur-spin" /><p>Loading reviews...</p></div>
      <style>{`.ur-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.ur-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:urs .7s linear infinite}@keyframes urs{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .ur-page,.ur-page *{box-sizing:border-box}
        .ur-page{max-width:900px;width:100%;overflow:hidden}
        .ur-header{margin-bottom:20px}
        .ur-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .ur-sub{font-size:14px;color:#888;margin:0}
        .ur-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;width:100%}
        .ur-stat{background:white;border-radius:10px;padding:14px 10px;border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s}
        .ur-stat:hover{border-color:#ccc}
        .ur-stat.on{border-color:#B8936D}
        .ur-stat-i{font-size:14px;margin-bottom:3px}
        .ur-stat-l{font-size:10px;color:#888;font-weight:500;margin-bottom:2px}
        .ur-stat-v{font-size:20px;font-weight:700;color:#2C2C2C}
        .ur-list{display:flex;flex-direction:column;gap:12px}
        .ur-card{background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0}
        .ur-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
        .ur-card-left{flex:1;min-width:0}
        .ur-card-name{font-size:15px;font-weight:700;color:#2C2C2C;margin-bottom:4px}
        .ur-card-rating{display:flex;align-items:center;gap:6px;margin-bottom:6px}
        .ur-stars{font-size:15px;letter-spacing:1px}
        .ur-rating-num{font-size:13px;color:#888}
        .ur-pkg-link{font-size:13px;color:#B8936D;text-decoration:none;font-weight:600}
        .ur-pkg-link:hover{text-decoration:underline}
        .ur-badges{display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap;flex-shrink:0}
        .ur-badge{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap}
        .ur-badge-approved{background:#ECFDF5;color:#10B981}
        .ur-badge-pending {background:#FEF3C7;color:#F59E0B}
        .ur-badge-verified{background:#EFF6FF;color:#3B82F6}
        .ur-text{font-size:14px;color:#4A4A4A;line-height:1.6;margin-bottom:12px}
        .ur-photos{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
        .ur-photo{width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #E5E5E0}
        .ur-card-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #f0f0ec;font-size:12px;color:#999;gap:8px;flex-wrap:wrap}
        .ur-footer-left{display:flex;gap:10px;flex-wrap:wrap}
        .ur-empty{background:white;border-radius:16px;padding:60px 24px;text-align:center;border:1px solid #E5E5E0}
        .ur-empty-icon{font-size:48px;margin-bottom:12px}
        .ur-empty-title{font-size:20px;font-weight:700;color:#2C2C2C;margin-bottom:8px}
        .ur-empty-sub{font-size:14px;color:#888}
        @media(max-width:1023px){.ur-title{font-size:24px}}
        @media(max-width:639px){
          .ur-page{width:100%;min-width:0;overflow-x:hidden}
          .ur-title{font-size:20px}
          .ur-sub{font-size:13px}
          .ur-stats{grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
          .ur-stat{padding:12px 6px;border-radius:8px;min-width:0;overflow:hidden}
          .ur-card{padding:14px;border-radius:10px}
          .ur-card-top{flex-direction:column;gap:8px}
          .ur-badges{flex-direction:row;flex-wrap:wrap}
          .ur-text{font-size:13px}
          .ur-photo{width:64px;height:64px}
          .ur-card-footer{flex-direction:column;align-items:flex-start;gap:4px}
          .ur-list{gap:10px}
        }
        @media(max-width:380px){
          .ur-stats{grid-template-columns:1fr 1fr}
          .ur-stat-v{font-size:18px}
        }
      `}</style>

      <div className="ur-page">
        <div className="ur-header">
          <h1 className="ur-title">Reviews</h1>
          <p className="ur-sub">All reviews from pilgrims for your agency</p>
        </div>

        <div className="ur-stats">
          {([
            { key: 'all',      icon: '💬', label: 'All',        v: stats.total },
            { key: 'approved', icon: '✅', label: 'Approved',   v: stats.approved },
            { key: 'pending',  icon: '⏳', label: 'Pending',    v: stats.pending },
            { key: 'rating',   icon: '⭐', label: 'Avg Rating', v: avgRating },
          ]).map((s: any) => (
            s.key === 'rating'
              ? (
                <div key="rating" className="ur-stat" style={{ cursor: 'default' }}>
                  <div className="ur-stat-i">{s.icon}</div>
                  <div className="ur-stat-l">{s.label}</div>
                  <div className="ur-stat-v" style={{ color: '#B8936D' }}>{s.v}</div>
                </div>
              ) : (
                <div key={s.key} className={`ur-stat${filter === s.key ? ' on' : ''}`} onClick={() => setFilter(s.key as any)}>
                  <div className="ur-stat-i">{s.icon}</div>
                  <div className="ur-stat-l">{s.label}</div>
                  <div className="ur-stat-v">{s.v}</div>
                </div>
              )
          ))}
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="ur-list">
              {paginated.map(review => (
                <div key={review.id} className="ur-card">
                  <div className="ur-card-top">
                    <div className="ur-card-left">
                      <div className="ur-card-name">{review.reviewer_name || 'Anonymous'}</div>
                      <div className="ur-card-rating">
                        <span className="ur-stars">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ color: s <= review.rating ? '#B8936D' : '#ddd' }}>★</span>
                          ))}
                        </span>
                        <span className="ur-rating-num">{review.rating}/5</span>
                      </div>
                      {review.packages && (
                        <Link href={`/pakej/${review.packages.slug}`} target="_blank" className="ur-pkg-link">
                          📦 {review.packages.title}
                        </Link>
                      )}
                    </div>
                    <div className="ur-badges">
                      <span className={`ur-badge ${review.is_approved ? 'ur-badge-approved' : 'ur-badge-pending'}`}>
                        {review.is_approved ? '✓ APPROVED' : '⏳ PENDING'}
                      </span>
                      {review.is_verified && <span className="ur-badge ur-badge-verified">✓ VERIFIED</span>}
                    </div>
                  </div>

                  <p className="ur-text">{review.review_text}</p>

                  {review.photos && review.photos.length > 0 && (
                    <div className="ur-photos">
                      {review.photos.map((photo: string, i: number) => (
                        <img key={i} src={photo} alt="" className="ur-photo" />
                      ))}
                    </div>
                  )}

                  <div className="ur-card-footer">
                    <div className="ur-footer-left">
                      <span>📅 Travel: {review.travel_date}</span>
                      <span>🕐 Posted: {new Date(review.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {review.reviewer_email && <span>📧 {review.reviewer_email}</span>}
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="ur-empty">
            <div className="ur-empty-icon">⭐</div>
            <div className="ur-empty-title">
              {filter === 'all' ? 'No Reviews Yet'
                : filter === 'approved' ? 'No Approved Reviews'
                : 'No Pending Reviews'}
            </div>
            <p className="ur-empty-sub">Reviews from pilgrims will appear here</p>
          </div>
        )}
      </div>
    </>
  )
}