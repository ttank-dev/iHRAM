'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusToggleButton'

interface Guide {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  is_published: boolean
  created_at: string
}

/* ── ActionButtons: TOP-LEVEL — same pattern as all admin pages ── */
function ActionButtons({ g, onToggle, onDelete }: {
  g: Guide
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string, title: string) => void
}) {
  return (
    <div className="gp-actions">
      <Link href={`/panduan/${g.slug}`} target="_blank" className="gp-btn gp-btn-slate">
        👁 View
      </Link>
      <Link href={`/admin/panduan/edit/${g.id}`} className="gp-btn gp-btn-blue">
        ✏️ Edit
      </Link>
      <button
        className={'gp-btn ' + (g.is_published ? 'gp-btn-amber' : 'gp-btn-green')}
        onClick={() => onToggle(g.id, g.is_published)}
      >
        {g.is_published ? '⏸ Unpublish' : '✓ Publish'}
      </button>
      <button
        className="gp-btn gp-btn-red"
        onClick={() => onDelete(g.id, g.title)}
      >
        🗑 Delete
      </button>
    </div>
  )
}

export default function AdminPanduanPage() {
  const supabase = createClient()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => { fetchGuides() }, [filter])

  const fetchGuides = async () => {
    setLoading(true)
    try {
      let query = supabase.from('guides').select('*').order('created_at', { ascending: false })
      if (filter === 'published') query = query.eq('is_published', true)
      else if (filter === 'draft') query = query.eq('is_published', false)

      const { data, error } = await query
      if (error) throw error
      setGuides(data || [])

      const { data: all } = await supabase.from('guides').select('id, is_published')
      if (all) {
        setStats({
          total: all.length,
          published: all.filter(g => g.is_published).length,
          draft: all.filter(g => !g.is_published).length
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    if (!confirm(current ? 'Unpublish this guide?' : 'Publish this guide?')) return
    const { error } = await supabase.from('guides').update({ is_published: !current }).eq('id', id)
    if (error) { alert('❌ Error updating'); return }
    setGuides(prev => prev.map(g => g.id === id ? { ...g, is_published: !current } : g))
    setStats(prev => ({
      ...prev,
      published: prev.published + (current ? -1 : 1),
      draft: prev.draft + (current ? 1 : -1),
    }))
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`⚠️ DELETE: ${title}\n\nThis action CANNOT be undone!`)) return
    const input = prompt(`Type "${title}" to confirm:`)
    if (input !== title) { alert('❌ Name does not match. Deletion cancelled.'); return }
    const { error } = await supabase.from('guides').delete().eq('id', id)
    if (error) { alert(`❌ Error: ${error.message}`); return }
    setGuides(prev => prev.filter(g => g.id !== id))
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      published: guides.find(g => g.id === id)?.is_published ? prev.published - 1 : prev.published,
      draft: !guides.find(g => g.id === id)?.is_published ? prev.draft - 1 : prev.draft,
    }))
  }

  const handleSearch = (v: string) => { setSearchQuery(v); setCurrentPage(1) }
  const handleFilter = (v: 'all' | 'published' | 'draft') => { setFilter(v); setCurrentPage(1) }

  const filtered = guides.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return (
    <>
      <div className="gp-load"><div className="gp-spin" /><p>Loading guides...</p></div>
      <style dangerouslySetInnerHTML={{ __html: `
        .gp-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}
        .gp-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:gps .7s linear infinite}
        @keyframes gps{to{transform:rotate(360deg)}}
      `}} />
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .gp,.gp *,.gp *::before,.gp *::after{box-sizing:border-box}
        .gp{width:100%;max-width:1100px}

        /* Header */
        .gp-hd{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
        .gp h1{font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .gp-sub{font-size:14px;color:#888;margin:0}
        .gp-add{
          padding:10px 20px;background:#B8936D;color:#fff;border:none;border-radius:8px;
          font-size:14px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px;
          white-space:nowrap;transition:background .15s;
        }
        .gp-add:hover{background:#a07d5a}

        /* Stats */
        .gp-stats{display:flex;gap:8px;margin-bottom:16px}
        .gp-st{
          flex:1 1 0%;min-width:0;background:#fff;border-radius:10px;padding:14px 8px;
          border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s;
        }
        .gp-st:hover{border-color:#ccc}
        .gp-st.on{border-color:#B8936D}
        .gp-st-i{font-size:16px;line-height:1}
        .gp-st-l{font-size:11px;color:#888;font-weight:500;margin:2px 0}
        .gp-st-v{font-size:22px;font-weight:700;color:#2C2C2C}

        /* Search */
        .gp-search{
          display:flex;align-items:center;gap:8px;
          background:#fff;border-radius:10px;padding:10px 14px;
          border:1px solid #E5E5E0;margin-bottom:14px;
        }
        .gp-search input{flex:1;border:none;outline:none;font-size:14px;background:transparent;color:#2C2C2C;min-width:0}
        .gp-search input::placeholder{color:#bbb}
        .gp-cnt{font-size:12px;color:#888;font-weight:600;white-space:nowrap}

        /* Table */
        .gp-table{background:#fff;border-radius:10px;border:1px solid #E5E5E0;overflow:hidden}
        .gp-thead{
          display:grid;grid-template-columns:2fr 1fr 1fr 1fr 220px;
          padding:12px 18px;background:#F5F5F0;border-bottom:1px solid #E5E5E0;
          font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;
        }
        .gp-trow{
          display:grid;grid-template-columns:2fr 1fr 1fr 1fr 220px;
          padding:14px 18px;border-bottom:1px solid #f0f0ec;align-items:center;
          transition:background .1s;
        }
        .gp-trow:hover{background:#FAFAF8}
        .gp-trow:last-child{border-bottom:none}

        /* Guide info cell */
        .gp-info{display:flex;align-items:center;gap:10px;min-width:0}
        .gp-thumb{
          width:48px;height:48px;border-radius:6px;background:#F5F5F0;flex-shrink:0;
          background-size:cover;background-position:center;
          display:flex;align-items:center;justify-content:center;font-size:20px;
        }
        .gp-ttl{font-size:14px;font-weight:600;color:#2C2C2C;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .gp-exc{font-size:12px;color:#999;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:250px}

        /* Category */
        .gp-cat{padding:4px 10px;background:rgba(184,147,109,.1);color:#B8936D;border-radius:5px;font-size:11px;font-weight:700;text-transform:capitalize;display:inline-block}
        .gp-nocat{font-size:13px;color:#ccc}

        /* Date */
        .gp-date{font-size:13px;color:#666}

        /* ── ACTION BUTTONS — same system as all admin pages ── */
        .gp-actions{display:grid;grid-template-columns:1fr 1fr;gap:4px;width:210px}
        .gp-btn{
          height:30px;
          padding:0 8px;
          border:none;
          border-radius:6px;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:3px;
          font-size:11px;
          font-weight:700;
          transition:filter 0.15s;
          white-space:nowrap;
          width:100%;
          text-decoration:none;
          font-family:inherit;
        }
        .gp-btn:hover{filter:brightness(0.92)}
        .gp-btn-slate  {background:#E2E8F0;color:#334155}
        .gp-btn-blue   {background:#3B82F6;color:white}
        .gp-btn-green  {background:#10B981;color:white}
        .gp-btn-amber  {background:#F59E0B;color:white}
        .gp-btn-red    {background:#EF4444;color:white}

        /* Pagination */
        .gp-pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;flex-wrap:wrap;border-top:1px solid #f0f0ec}
        .gp-pg-btn{padding:8px 16px;background:white;border:1px solid #E5E5E0;border-radius:8px;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;white-space:nowrap}
        .gp-pg-btn:hover:not(:disabled){border-color:#B8936D;color:#B8936D}
        .gp-pg-btn:disabled{opacity:.4;cursor:not-allowed}
        .gp-pg-pages{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
        .gp-pg-num{width:36px;height:36px;border:1px solid #E5E5E0;border-radius:8px;background:white;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
        .gp-pg-num:hover{border-color:#B8936D;color:#B8936D}
        .gp-pg-num.active{background:#B8936D;border-color:#B8936D;color:white}
        .gp-pg-ellipsis{color:#aaa;font-size:13px;padding:0 2px}

        /* Cards (mobile) */
        .gp-cards{display:none}
        .gp-card{background:#fff;border-radius:10px;padding:14px;border:1px solid #E5E5E0;margin-bottom:8px}
        .gp-card-top{display:flex;gap:10px;margin-bottom:10px}
        .gp-card-body{flex:1;min-width:0}
        .gp-card-ttl{font-size:14px;font-weight:600;color:#2C2C2C;margin-bottom:4px}
        .gp-card-exc{font-size:12px;color:#999;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .gp-card-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11px;color:#888}
        .gp-card-acts{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding-top:10px;border-top:1px solid #f0f0ec}
        .gp-card-acts .gp-btn{height:34px;font-size:12px}

        /* Empty */
        .gp-empty{background:#fff;border-radius:10px;padding:40px 16px;text-align:center;border:1px solid #E5E5E0}
        .gp-empty p{font-size:14px;color:#888;margin:8px 0 0}

        /* Desktop ≥1024px */
        @media(min-width:1024px){
          .gp h1{font-size:28px}
          .gp-sub{font-size:15px}
          .gp-stats{gap:12px;margin-bottom:20px}
          .gp-st{padding:20px 16px;border-radius:12px}
          .gp-st-i{font-size:20px}
          .gp-st-l{font-size:13px}
          .gp-st-v{font-size:28px}
          .gp-search{padding:14px 20px;border-radius:12px;margin-bottom:20px}
          .gp-search input{font-size:15px}
          .gp-table{border-radius:12px}
          .gp-trow{padding:16px 20px}
          .gp-thumb{width:56px;height:56px}
        }

        /* Tablet 640–1023px */
        @media(min-width:640px) and (max-width:1023px){
          .gp-thead{grid-template-columns:2fr 1fr 1fr 210px}
          .gp-trow{grid-template-columns:2fr 1fr 1fr 210px}
          .gp-thead>div:nth-child(2),.gp-trow>div:nth-child(2){display:none}
          .gp-st{padding:16px 12px}
          .gp-st-v{font-size:24px}
        }

        /* Mobile <640px */
        @media(max-width:639px){
          .gp-table{display:none}
          .gp-cards{display:block}
          .gp-stats{gap:6px}
          .gp-st{padding:10px 4px;border-radius:8px}
          .gp-st-v{font-size:18px}
          .gp-st-l{font-size:9px}
          .gp-st-i{font-size:13px}
          .gp-hd{flex-direction:column;align-items:flex-start;gap:8px}
          .gp-add{width:100%;justify-content:center;padding:12px}
          .gp h1{font-size:20px}
          .gp-sub{font-size:12px;margin-bottom:4px}
          .gp-search{padding:8px 10px;border-radius:8px}
          .gp-search input{font-size:13px}
          .gp-pg-btn{padding:8px 10px;font-size:12px}
          .gp-pg-num{width:32px;height:32px;font-size:12px}
        }
      `}} />

      <div className="gp">

        {/* Header */}
        <div className="gp-hd">
          <div>
            <h1>Manage Guides</h1>
            <p className="gp-sub">Create & manage Umrah guides for pilgrims</p>
          </div>
          <Link href="/admin/panduan/new" className="gp-add">➕ New Guide</Link>
        </div>

        {/* Stats — clickable filters */}
        <div className="gp-stats">
          {([
            { key: 'all'       as const, i: '📚', l: 'All',       v: stats.total },
            { key: 'published' as const, i: '✅', l: 'Published', v: stats.published },
            { key: 'draft'     as const, i: '📝', l: 'Draft',     v: stats.draft },
          ]).map(s => (
            <div key={s.key} className={`gp-st ${filter === s.key ? 'on' : ''}`} onClick={() => handleFilter(s.key)}>
              <div className="gp-st-i">{s.i}</div>
              <div className="gp-st-l">{s.l}</div>
              <div className="gp-st-v">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="gp-search">
          🔍
          <input
            placeholder="Search guides..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />
          <span className="gp-cnt">
            {filtered.length} guides{totalPages > 1 && ` • Page ${currentPage}/${totalPages}`}
          </span>
        </div>

        {/* TABLE (desktop/tablet) */}
        <div className="gp-table">
          <div className="gp-thead">
            <div>Guide</div>
            <div>Category</div>
            <div>Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {paginated.map(g => (
            <div key={g.id} className="gp-trow">
              <div className="gp-info">
                <div className="gp-thumb" style={g.cover_image ? { backgroundImage: `url(${g.cover_image})` } : {}}>
                  {!g.cover_image && '📖'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="gp-ttl">{g.title}</div>
                  <div className="gp-exc">{g.excerpt || 'No description'}</div>
                </div>
              </div>
              <div>{g.category ? <span className="gp-cat">{g.category}</span> : <span className="gp-nocat">—</span>}</div>
              <div className="gp-date">
                {new Date(g.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div>
                <StatusBadge status={g.is_published ? 'published' : 'draft'} />
              </div>
              <ActionButtons g={g} onToggle={handleToggle} onDelete={handleDelete} />
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="gp-empty">
              <div style={{ fontSize: 36 }}>🔍</div>
              <p><b>No guides found</b></p>
              <p>{searchQuery ? 'Try adjusting your search' : 'No guides yet'}</p>
              {!searchQuery && (
                <Link href="/admin/panduan/new" className="gp-add" style={{ marginTop: 16, display: 'inline-flex' }}>
                  ➕ Create First Guide
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="gp-pagination">
              <button className="gp-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
              <div className="gp-pg-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={'e' + i} className="gp-pg-ellipsis">...</span>
                      : <button key={p} className={'gp-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                  )}
              </div>
              <button className="gp-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
            </div>
          )}
        </div>

        {/* CARDS (mobile) */}
        <div className="gp-cards">
          {paginated.map(g => (
            <div key={g.id} className="gp-card">
              <div className="gp-card-top">
                <div className="gp-thumb" style={g.cover_image ? { backgroundImage: `url(${g.cover_image})`, width: 48, height: 48 } : { width: 48, height: 48 }}>
                  {!g.cover_image && '📖'}
                </div>
                <div className="gp-card-body">
                  <div className="gp-card-ttl">{g.title}</div>
                  <div className="gp-card-exc">{g.excerpt || 'No description'}</div>
                  <div className="gp-card-meta">
                    <StatusBadge status={g.is_published ? 'published' : 'draft'} />
                    {g.category && <span className="gp-cat">{g.category}</span>}
                    <span>{new Date(g.created_at).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              <div className="gp-card-acts">
                <ActionButtons g={g} onToggle={handleToggle} onDelete={handleDelete} />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="gp-empty">
              <div style={{ fontSize: 36 }}>🔍</div>
              <p><b>No guides found</b></p>
              {!searchQuery && (
                <Link href="/admin/panduan/new" className="gp-add" style={{ marginTop: 12, display: 'inline-flex' }}>
                  ➕ Create Guide
                </Link>
              )}
            </div>
          )}

          {/* Pagination (mobile) */}
          {totalPages > 1 && (
            <div className="gp-pagination">
              <button className="gp-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
              <div className="gp-pg-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={'e' + i} className="gp-pg-ellipsis">...</span>
                      : <button key={p} className={'gp-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                  )}
              </div>
              <button className="gp-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
            </div>
          )}
        </div>

      </div>
    </>
  )
}