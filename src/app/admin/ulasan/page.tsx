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

  useEffect(() => { fetchReviews() }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('reviews')
        .select(`*, agencies ( name, slug ), packages ( title, slug )`)
        .order('created_at', { ascending: false })

      if (filter === 'pending') query = query.eq('is_approved', false)
      else if (filter === 'approved') query = query.eq('is_approved', true)

      const { data, error } = await query
      if (error) throw error
      setReviews(data || [])

      const { data: all } = await supabase.from('reviews').select('id, is_approved')
      if (all) {
        setStats({
          total: all.length,
          pending: all.filter(r => !r.is_approved).length,
          approved: all.filter(r => r.is_approved).length
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Luluskan ulasan ini?')) return
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: true }).eq('id', id)
      if (error) throw error
      alert('✅ Ulasan diluluskan!')
      fetchReviews()
    } catch { alert('❌ Ralat meluluskan ulasan') }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Tolak ulasan ini?')) return
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: false }).eq('id', id)
      if (error) throw error
      alert('❌ Ulasan ditolak!')
      fetchReviews()
    } catch { alert('❌ Ralat menolak ulasan') }
  }

  const handleToggleVerified = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('reviews').update({ is_verified: !current }).eq('id', id)
      if (error) throw error
      alert(current ? '⭐ Badge verified dibuang!' : '⭐ Badge verified ditambah!')
      fetchReviews()
    } catch { alert('❌ Ralat kemaskini') }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ PADAM ulasan oleh ${name || 'Anonymous'}?\n\nTindakan ini TIDAK boleh dibatalkan!`)) return
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error
      alert('🗑️ Ulasan berjaya dipadam!')
      fetchReviews()
    } catch (e: any) { alert(`❌ Ralat: ${e.message}`) }
  }

  const filtered = reviews.filter(r =>
    r.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.review_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.agencies?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* ── LOADING ── */
  if (loading) return (
    <>
      <div className="au-loading"><div className="au-spinner" /><p>Memuatkan ulasan...</p></div>
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
        /* ═══ RESET ═══ */
        .au,.au *,.au *::before,.au *::after{box-sizing:border-box}

        /* ═══ PAGE ═══ */
        .au{width:100%;max-width:900px}

        /* ═══ HEADER ═══ */
        .au h1{font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .au-sub{font-size:14px;color:#888;margin:0 0 16px}

        /* ═══ STATS ═══ */
        .au-stats{display:flex;gap:8px;margin-bottom:16px}
        .au-st{
          flex:1 1 0%;min-width:0;
          background:#fff;border-radius:10px;padding:14px 8px;
          border:2px solid #E5E5E0;cursor:pointer;text-align:center;
          transition:border-color .15s;
        }
        .au-st:hover{border-color:#ccc}
        .au-st.on{border-color:#B8936D}
        .au-st-i{font-size:16px;line-height:1}
        .au-st-l{font-size:11px;color:#888;font-weight:500;margin:2px 0}
        .au-st-v{font-size:22px;font-weight:700;color:#2C2C2C}

        /* ═══ SEARCH ═══ */
        .au-search{
          display:flex;align-items:center;gap:8px;
          background:#fff;border-radius:10px;padding:10px 14px;
          border:1px solid #E5E5E0;margin-bottom:14px;
        }
        .au-search input{
          flex:1;border:none;outline:none;font-size:14px;
          background:transparent;color:#2C2C2C;min-width:0;
        }
        .au-search input::placeholder{color:#bbb}
        .au-cnt{font-size:12px;color:#888;font-weight:600;white-space:nowrap}

        /* ═══ REVIEW CARD ═══ */
        .au-card{
          background:#fff;border-radius:10px;padding:18px;
          border:1px solid #E5E5E0;margin-bottom:10px;
        }
        .au-card.pend{border-left:3px solid #F59E0B}

        .au-card-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px}
        .au-card-left{flex:1;min-width:0}
        .au-name-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px}
        .au-name{font-size:14px;font-weight:600;color:#2C2C2C}
        .au-vb{font-size:9px;font-weight:700;color:#10B981;background:rgba(16,185,129,.1);padding:1px 6px;border-radius:3px}
        .au-stars{font-size:13px;letter-spacing:1px}
        .au-meta{font-size:12px;color:#888}
        .au-date{font-size:11px;color:#aaa}
        .au-sb{padding:3px 10px;border-radius:5px;font-size:10px;font-weight:700;white-space:nowrap;flex-shrink:0}
        .au-sb.ok{background:rgba(16,185,129,.1);color:#10B981}
        .au-sb.wait{background:rgba(245,158,11,.1);color:#F59E0B}

        .au-txt{font-size:13px;color:#2C2C2C;line-height:1.6;padding:12px;background:#FAFAF8;border-radius:6px;margin-bottom:10px;word-break:break-word}

        .au-photos{display:flex;gap:6px;margin-bottom:10px;overflow-x:auto}
        .au-photos img{width:64px;height:64px;object-fit:cover;border-radius:6px;flex-shrink:0}
        .au-pm{width:64px;height:64px;background:#F5F5F0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#666;flex-shrink:0}

        .au-acts{display:flex;gap:6px;padding-top:10px;border-top:1px solid #f0f0ec;flex-wrap:wrap}
        .au-b{padding:7px 14px;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;white-space:nowrap}
        .au-b-ok{background:#10B981;color:#fff}.au-b-ok:hover{background:#059669}
        .au-b-rj{background:transparent;color:#EF4444;border:1px solid #EF4444}.au-b-rj:hover{background:#FEE2E2}
        .au-b-von{background:#F59E0B;color:#fff}.au-b-von:hover{background:#D97706}
        .au-b-voff{background:#F5F5F0;color:#2C2C2C}.au-b-voff:hover{background:#e8e8e3}
        .au-b-del{background:transparent;color:#EF4444;border:1px solid #E5E5E0;margin-left:auto}.au-b-del:hover{background:#FEE2E2;border-color:#EF4444}

        .au-empty{background:#fff;border-radius:10px;padding:40px 16px;text-align:center;border:1px solid #E5E5E0}
        .au-empty p{font-size:14px;color:#888;margin-top:8px}

        /* ═══ DESKTOP ≥1024px ═══ */
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
          .au-photos img{width:80px;height:80px}
          .au-pm{width:80px;height:80px;font-size:13px}
          .au-b{padding:8px 18px;font-size:13px}
        }

        /* ═══ TABLET 640–1023px ═══ */
        @media(min-width:640px) and (max-width:1023px){
          .au-st{padding:16px 12px}
          .au-st-v{font-size:24px}
          .au-st-l{font-size:12px}
          .au-card{padding:18px}
          .au-photos img{width:72px;height:72px}
          .au-pm{width:72px;height:72px}
        }

        /* ═══ MOBILE <640px ═══ */
        @media(max-width:639px){
          .au-stats{gap:6px}
          .au-st{padding:10px 4px;border-radius:8px}
          .au-st-v{font-size:18px}
          .au-st-l{font-size:9px}
          .au-st-i{font-size:13px}
          .au-card{padding:14px;border-radius:8px}
          .au-card-hd{flex-direction:column;gap:6px}
          .au-txt{padding:10px;font-size:12px}
          .au-acts{flex-direction:column}
          .au-b{width:100%;text-align:center;padding:10px}
          .au-b-del{margin-left:0}
          .au-search{padding:8px 10px;border-radius:8px}
          .au-search input{font-size:13px}
          .au h1{font-size:20px}
          .au-sub{font-size:12px;margin-bottom:12px}
        }
      `}} />

      <div className="au">
        <h1>Urus Ulasan</h1>
        <p className="au-sub">Semak, luluskan & moderasi semua ulasan jemaah</p>

        {/* Stats */}
        <div className="au-stats">
          {([
            { key: 'all' as const, i: '⭐', l: 'Semua', v: stats.total },
            { key: 'pending' as const, i: '⏳', l: 'Pending', v: stats.pending },
            { key: 'approved' as const, i: '✅', l: 'Lulus', v: stats.approved },
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
          <input placeholder="Cari nama, ulasan, agensi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <span className="au-cnt">{filtered.length} ulasan</span>
        </div>

        {/* Reviews */}
        {filtered.map(r => (
          <div key={r.id} className={`au-card ${!r.is_approved ? 'pend' : ''}`}>
            <div className="au-card-hd">
              <div className="au-card-left">
                <div className="au-name-row">
                  <span className="au-name">{r.reviewer_name || 'Anonymous'}</span>
                  {r.is_verified && <span className="au-vb">VERIFIED</span>}
                  <span className="au-stars">
                    {[1,2,3,4,5].map(n => <span key={n} style={{color: n <= r.rating ? '#F59E0B' : '#ddd'}}>★</span>)}
                  </span>
                </div>
                <div className="au-meta">{r.agencies?.name}{r.packages?.title && ` • ${r.packages.title}`}</div>
                <div className="au-date">
                  {new Date(r.created_at).toLocaleDateString('ms-MY',{year:'numeric',month:'long',day:'numeric'})}
                  {r.travel_date && ` • Travel: ${r.travel_date}`}
                </div>
              </div>
              <span className={`au-sb ${r.is_approved ? 'ok' : 'wait'}`}>
                {r.is_approved ? 'DILULUSKAN' : 'PENDING'}
              </span>
            </div>

            <div className="au-txt">{r.review_text}</div>

            {r.photos && r.photos.length > 0 && (
              <div className="au-photos">
                {r.photos.slice(0,4).map((p,i) => <img key={i} src={p} alt="" />)}
                {r.photos.length > 4 && <div className="au-pm">+{r.photos.length-4}</div>}
              </div>
            )}

            <div className="au-acts">
              {!r.is_approved
                ? <button className="au-b au-b-ok" onClick={() => handleApprove(r.id)}>✓ Luluskan</button>
                : <button className="au-b au-b-rj" onClick={() => handleReject(r.id)}>✕ Batal</button>
              }
              <button className={`au-b ${r.is_verified ? 'au-b-von' : 'au-b-voff'}`}
                onClick={() => handleToggleVerified(r.id, r.is_verified)}>
                ⭐ {r.is_verified ? 'Unverify' : 'Verify'}
              </button>
              <button className="au-b au-b-del" onClick={() => handleDelete(r.id, r.reviewer_name || 'Anonymous')}>🗑️ Padam</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="au-empty">
            <div style={{fontSize:36}}>🔍</div>
            <p><b>Tiada ulasan ditemui</b></p>
            <p>{searchQuery ? 'Cuba ubah carian' : 'Belum ada ulasan'}</p>
          </div>
        )}
      </div>
    </>
  )
}