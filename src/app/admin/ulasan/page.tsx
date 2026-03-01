'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  reviewer_name: string | null
  reviewer_email: string | null
  rating: number
  review_text: string
  travel_date: string | null
  photos: string[] | null
  is_verified: boolean
  is_approved: boolean
  created_at: string
  agency_id: string
  package_id: string | null
  agencies?: { name: string; slug: string }
  packages?: { title: string; slug: string }
}

export default function AdminUlasanPage() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => { fetchReviews(); setCurrentPage(1) }, [filter])
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('reviews')
        .select(`*, agencies ( name, slug ), packages ( title, slug )`)
        .order('created_at', { ascending: false })
      if (filter === 'pending')  query = query.eq('is_approved', false)
      else if (filter === 'approved') query = query.eq('is_approved', true)
      const { data, error } = await query
      if (error) throw error
      setReviews(data || [])
      const { data: all } = await supabase.from('reviews').select('id, is_approved')
      if (all) setStats({
        total:    all.length,
        pending:  all.filter(r => !r.is_approved).length,
        approved: all.filter(r =>  r.is_approved).length,
      })
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleApproval = async (id: string, current: boolean) => {
    if (!confirm(current ? 'Revoke approval for this review?' : 'Approve this review?')) return
    const { error } = await supabase.from('reviews').update({ is_approved: !current }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: !current } : r))
    setStats(prev => ({
      ...prev,
      approved: prev.approved + (current ? -1 : 1),
      pending:  prev.pending  + (current ?  1 : -1),
    }))
  }

  const handleToggleVerified = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reviews').update({ is_verified: !current }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_verified: !current } : r))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete review by "${name}"?\n\nThis cannot be undone.`)) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    const r = reviews.find(r => r.id === id)
    setReviews(prev => prev.filter(r => r.id !== id))
    if (r) setStats(prev => ({
      total:    prev.total - 1,
      approved: prev.approved - (r.is_approved ? 1 : 0),
      pending:  prev.pending  - (r.is_approved ? 0 : 1),
    }))
  }

  const filtered = reviews.filter(r =>
    r.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.review_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.agencies?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return (
    <>
      <div className="au-loading"><div className="au-spinner" /><p>Loading reviews...</p></div>
      <style dangerouslySetInnerHTML={{ __html: `
        .au-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}
        .au-spinner{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:sp .7s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}
      `}} />
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .au,.au *,.au *::before,.au *::after{box-sizing:border-box}
        .au{width:100%;max-width:900px}
        .au h1{font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .au-sub{font-size:14px;color:#888;margin:0 0 16px}

        /* Stats */
        .au-stats{display:flex;gap:8px;margin-bottom:16px}
        .au-st{flex:1 1 0%;min-width:0;background:#fff;border-radius:10px;padding:14px 8px;border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s}
        .au-st:hover{border-color:#ccc}
        .au-st.on{border-color:#B8936D}
        .au-st-i{font-size:16px;line-height:1}
        .au-st-l{font-size:11px;color:#888;font-weight:500;margin:2px 0}
        .au-st-v{font-size:22px;font-weight:700;color:#2C2C2C}

        /* Search */
        .au-search{display:flex;align-items:center;gap:8px;background:#fff;border-radius:10px;padding:10px 14px;border:1px solid #E5E5E0;margin-bottom:14px}
        .au-search input{flex:1;border:none;outline:none;font-size:14px;background:transparent;color:#2C2C2C;min-width:0}
        .au-search input::placeholder{color:#bbb}
        .au-cnt{font-size:12px;color:#888;font-weight:600;white-space:nowrap}

        /* Card */
        .au-card{background:#fff;border-radius:10px;padding:18px;border:1px solid #E5E5E0;margin-bottom:10px}
        .au-card.pend{border-left:3px solid #F59E0B}
        .au-card-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px}
        .au-card-left{flex:1;min-width:0}
        .au-name-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px}
        .au-name{font-size:14px;font-weight:600;color:#2C2C2C}
        .au-vb{font-size:9px;font-weight:700;color:#10B981;background:rgba(16,185,129,.1);padding:1px 6px;border-radius:3px}
        .au-stars{font-size:13px;letter-spacing:1px}
        .au-meta{font-size:12px;color:#888}
        .au-date{font-size:11px;color:#aaa}

        /* Status badge inline */
        .au-badge-approved{padding:3px 8px;border-radius:5px;font-size:11px;font-weight:700;background:rgba(16,185,129,.1);color:#10B981;white-space:nowrap}
        .au-badge-pending {padding:3px 8px;border-radius:5px;font-size:11px;font-weight:700;background:rgba(245,158,11,.1); color:#F59E0B;white-space:nowrap}

        /* Review text */
        .au-txt{font-size:13px;color:#2C2C2C;line-height:1.6;padding:12px;background:#FAFAF8;border-radius:6px;margin-bottom:10px;word-break:break-word}

        /* Photos */
        .au-photos{display:flex;gap:6px;margin-bottom:10px;overflow-x:auto}
        .au-photos img{width:64px;height:64px;object-fit:cover;border-radius:6px;flex-shrink:0}
        .au-pm{width:64px;height:64px;background:#F5F5F0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#666;flex-shrink:0}

        /* ── ACTION BUTTONS — 2×2 grid, exact same as all admin pages ── */
        .au-acts{padding-top:10px;border-top:1px solid #f0f0ec}
        .au-actions{display:grid;grid-template-columns:1fr 1fr;gap:4px}
        .au-btn{
          height:30px;
          padding:0 8px;
          border:none;
          border-radius:6px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:11px;
          font-weight:700;
          transition:filter .15s;
          white-space:nowrap;
          width:100%;
          font-family:inherit;
          overflow:hidden;
        }
        .au-btn:hover{filter:brightness(0.92)}
        .au-btn-green {background:#10B981;color:white}
        .au-btn-amber {background:#F59E0B;color:white}
        .au-btn-blue  {background:#3B82F6;color:white}
        .au-btn-purple{background:#8B5CF6;color:white}
        .au-btn-red   {background:#EF4444;color:white}
        .au-btn-span2 {grid-column:1 / -1}

        /* Empty */
        .au-empty{background:#fff;border-radius:10px;padding:40px 16px;text-align:center;border:1px solid #E5E5E0}
        .au-empty p{font-size:14px;color:#888;margin-top:8px}

        /* Pagination */
        .au-pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px 0 4px;flex-wrap:wrap}
        .au-pg-btn{padding:8px 16px;background:white;border:1px solid #E5E5E0;border-radius:8px;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;white-space:nowrap}
        .au-pg-btn:hover:not(:disabled){border-color:#B8936D;color:#B8936D}
        .au-pg-btn:disabled{opacity:.4;cursor:not-allowed}
        .au-pg-pages{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
        .au-pg-num{width:36px;height:36px;border:1px solid #E5E5E0;border-radius:8px;background:white;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
        .au-pg-num:hover{border-color:#B8936D;color:#B8936D}
        .au-pg-num.active{background:#B8936D;border-color:#B8936D;color:white}
        .au-pg-ellipsis{color:#aaa;font-size:13px;padding:0 2px}

        /* Desktop ≥1024px */
        @media(min-width:1024px){
          .au h1{font-size:28px}
          .au-sub{font-size:15px;margin-bottom:20px}
          .au-stats{gap:12px;margin-bottom:20px}
          .au-st{padding:20px 16px;border-radius:12px}
          .au-st-i{font-size:20px}
          .au-st-l{font-size:13px}
          .au-st-v{font-size:28px}
          .au-search{padding:14px 20px;margin-bottom:20px;border-radius:12px}
          .au-search input{font-size:15px}
          .au-card{padding:22px;border-radius:12px;margin-bottom:12px}
          .au-name{font-size:15px}
          .au-txt{font-size:14px;padding:14px}
          .au-photos img,.au-pm{width:80px;height:80px}
          .au-btn{height:32px;font-size:12px}
        }

        /* Tablet 640–1023px */
        @media(min-width:640px) and (max-width:1023px){
          .au-st{padding:16px 12px}
          .au-st-v{font-size:24px}
          .au-st-l{font-size:12px}
          .au-card{padding:18px}
          .au-photos img,.au-pm{width:72px;height:72px}
        }

        /* Mobile <640px */
        @media(max-width:639px){
          .au-stats{gap:6px}
          .au-st{padding:10px 4px;border-radius:8px}
          .au-st-v{font-size:18px}
          .au-st-l{font-size:9px}
          .au-st-i{font-size:13px}
          .au-card{padding:14px;border-radius:8px}
          .au-card-hd{flex-direction:column;gap:6px}
          .au-txt{padding:10px;font-size:12px}
          .au-search{padding:8px 10px;border-radius:8px}
          .au-search input{font-size:13px}
          .au h1{font-size:20px}
          .au-sub{font-size:12px;margin-bottom:12px}
          .au-pg-btn{padding:8px 10px;font-size:12px}
          .au-pg-num{width:32px;height:32px;font-size:12px}
          .au-btn{height:34px;font-size:12px}
        }
      `}} />

      <div className="au">
        <h1>Manage Reviews</h1>
        <p className="au-sub">Review, approve & moderate all pilgrim reviews</p>

        {/* Stats */}
        <div className="au-stats">
          {([
            { key: 'all'      as const, i: '⭐', l: 'All',      v: stats.total },
            { key: 'pending'  as const, i: '⏳', l: 'Pending',  v: stats.pending },
            { key: 'approved' as const, i: '✅', l: 'Approved', v: stats.approved },
          ]).map(s => (
            <div key={s.key} className={`au-st ${filter === s.key ? 'on' : ''}`} onClick={() => setFilter(s.key)}>
              <div className="au-st-i">{s.i}</div>
              <div className="au-st-l">{s.l}</div>
              <div className="au-st-v">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="au-search">
          🔍
          <input
            placeholder="Search name, review, agency..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <span className="au-cnt">
            {filtered.length} reviews{totalPages > 1 ? ' · Page ' + currentPage + '/' + totalPages : ''}
          </span>
        </div>

        {/* Review Cards */}
        {paginated.map(r => (
          <div key={r.id} className={`au-card ${!r.is_approved ? 'pend' : ''}`}>

            {/* Card Header */}
            <div className="au-card-hd">
              <div className="au-card-left">
                <div className="au-name-row">
                  <span className="au-name">{r.reviewer_name || 'Anonymous'}</span>
                  {r.is_verified && <span className="au-vb">VERIFIED</span>}
                  <span className="au-stars">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} style={{ color: n <= r.rating ? '#F59E0B' : '#ddd' }}>★</span>
                    ))}
                  </span>
                </div>
                <div className="au-meta">
                  {r.agencies?.name}{r.packages?.title && ` · ${r.packages.title}`}
                </div>
                <div className="au-date">
                  {new Date(r.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {r.travel_date && ` · Travel: ${r.travel_date}`}
                </div>
              </div>
              <span className={r.is_approved ? 'au-badge-approved' : 'au-badge-pending'}>
                {r.is_approved ? '✅ Approved' : '⏳ Pending'}
              </span>
            </div>

            {/* Review Text */}
            <div className="au-txt">{r.review_text}</div>

            {/* Photos */}
            {r.photos && r.photos.length > 0 && (
              <div className="au-photos">
                {r.photos.slice(0, 4).map((p, i) => <img key={i} src={p} alt="" />)}
                {r.photos.length > 4 && <div className="au-pm">+{r.photos.length - 4}</div>}
              </div>
            )}

            {/* Actions — 2×2 grid */}
            <div className="au-acts">
              <div className="au-actions">
                <button
                  className={'au-btn ' + (r.is_approved ? 'au-btn-amber' : 'au-btn-green')}
                  onClick={() => handleToggleApproval(r.id, r.is_approved)}
                >
                  {r.is_approved ? 'Revoke' : 'Approve'}
                </button>
                <button
                  className={'au-btn ' + (r.is_verified ? 'au-btn-purple' : 'au-btn-blue')}
                  onClick={() => handleToggleVerified(r.id, r.is_verified)}
                >
                  {r.is_verified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  className="au-btn au-btn-red au-btn-span2"
                  onClick={() => handleDelete(r.id, r.reviewer_name || 'Anonymous')}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="au-pagination">
            <button className="au-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
            <div className="au-pg-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={'e' + i} className="au-pg-ellipsis">...</span>
                    : <button key={p} className={'au-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                )}
            </div>
            <button className="au-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
          </div>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="au-empty">
            <div style={{ fontSize: 36 }}>🔍</div>
            <p><b>No reviews found</b></p>
            <p>{searchQuery ? 'Try a different search term' : 'No reviews yet'}</p>
          </div>
        )}
      </div>
    </>
  )
}