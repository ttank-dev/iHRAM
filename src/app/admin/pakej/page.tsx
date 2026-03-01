'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusToggleButton'

interface Package {
  id: string
  title: string
  slug: string
  description: string | null
  package_type: string | null
  price_quad: number | null
  price_triple: number | null
  price_double: number | null
  price_child: number | null
  price_infant: number | null
  departure_dates: string[] | null
  duration_nights: number | null
  departure_city: string | null
  visa_type: string | null
  itinerary: string | null
  inclusions: string[] | null
  exclusions: string[] | null
  photos: string[] | null
  quota: number | null
  status: string
  is_featured: boolean
  created_at: string
  agency_id: string
  agencies?: { name: string; slug: string; is_verified: boolean }
}

/* ── ActionButtons: TOP-LEVEL — 2×2 grid, exact same as Guides page ── */
function ActionButtons({ pkg, onToggleFeatured, onChangeStatus, onDelete }: {
  pkg: Package
  onToggleFeatured: (id: string, current: boolean) => void
  onChangeStatus: (id: string, newStatus: string) => void
  onDelete: (id: string, title: string) => void
}) {
  // Status cycle: draft → published → archived → draft
  const nextStatus = pkg.status === 'published' ? 'draft'
    : pkg.status === 'draft' ? 'published'
    : 'draft'
  const statusLabel = pkg.status === 'published' ? '⏸ Unpublish'
    : pkg.status === 'draft' ? '✓ Publish'
    : '↩ Restore'
  const statusClass = pkg.status === 'published' ? 'ap-btn ap-btn-amber'
    : pkg.status === 'draft' ? 'ap-btn ap-btn-green'
    : 'ap-btn ap-btn-slate'

  return (
    <div className="ap-actions">
      <Link href={`/pakej/${pkg.slug}`} target="_blank" className="ap-btn ap-btn-slate">
        👁 View
      </Link>
      <button
        className={pkg.is_featured ? 'ap-btn ap-btn-amber' : 'ap-btn ap-btn-blue'}
        onClick={() => onToggleFeatured(pkg.id, pkg.is_featured)}
      >
        {pkg.is_featured ? '⭐ Featured' : '☆ Feature'}
      </button>
      <button
        className={statusClass}
        onClick={() => onChangeStatus(pkg.id, nextStatus)}
      >
        {statusLabel}
      </button>
      <button className="ap-btn ap-btn-red" onClick={() => onDelete(pkg.id, pkg.title)}>
        🗑 Delete
      </button>
    </div>
  )
}

export default function AdminPakejPage() {
  const supabase = createClient()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => { fetchPackages(); setCurrentPage(1) }, [filter])
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const fetchPackages = async () => {
    setLoading(true)
    try {
      let query = supabase.from('packages').select(`*, agencies ( name, slug, is_verified )`).order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setPackages(data || [])

      const { data: allPkgs } = await supabase.from('packages').select('id, status')
      if (allPkgs) {
        setStats({
          total:     allPkgs.length,
          published: allPkgs.filter(p => p.status === 'published').length,
          draft:     allPkgs.filter(p => p.status === 'draft').length,
          archived:  allPkgs.filter(p => p.status === 'archived').length,
        })
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('packages').update({ is_featured: !current }).eq('id', id)
    if (error) { alert('Error updating featured status'); return }
    setPackages(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p))
  }

  const handleChangeStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('packages').update({ status: newStatus }).eq('id', id)
    if (error) { alert('Error updating status'); return }
    fetchPackages()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`⚠️ DELETE: "${title}"\n\nThis action CANNOT be undone!`)) return
    const input = prompt(`Type "${title}" to confirm:`)
    if (input !== title) { alert('❌ Name does not match. Deletion cancelled.'); return }
    const { error } = await supabase.from('packages').delete().eq('id', id)
    if (error) { alert(`❌ Error: ${error.message}`); return }
    setPackages(prev => prev.filter(p => p.id !== id))
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      [packages.find(p => p.id === id)?.status || 'draft']:
        prev[packages.find(p => p.id === id)?.status as keyof typeof prev || 'draft'] - 1
    }))
  }

  const filtered = packages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.agencies?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const statCards = [
    { key: 'all'       as const, icon: '📦', label: 'All',       value: stats.total,     color: '#8B5CF6' },
    { key: 'published' as const, icon: '✅', label: 'Published', value: stats.published,  color: '#10B981' },
    { key: 'draft'     as const, icon: '📝', label: 'Draft',     value: stats.draft,      color: '#F59E0B' },
    { key: 'archived'  as const, icon: '🗄️', label: 'Archived',  value: stats.archived,   color: '#EF4444' },
  ]

  if (loading) return (
    <div className="ap-loading">
      <div className="ap-loading-spinner" />
      <p className="ap-loading-text">Loading packages...</p>
      <style dangerouslySetInnerHTML={{ __html: `
        .ap-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;}
        .ap-loading-spinner{width:40px;height:40px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:apspin .8s linear infinite;}
        .ap-loading-text{font-size:14px;color:#999;font-weight:500;}
        @keyframes apspin{to{transform:rotate(360deg);}}
      `}} />
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ap,.ap *,.ap *::before,.ap *::after{box-sizing:border-box}
        .ap{width:100%;max-width:1200px}

        /* Header */
        .ap-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .ap-subtitle{font-size:15px;color:#888;margin:0 0 24px}

        /* Stats */
        .ap-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .ap-stat-card{background:white;border-radius:12px;padding:18px;border:2px solid #E5E5E0;cursor:pointer;transition:all .2s}
        .ap-stat-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
        .ap-stat-card.active{border-color:#B8936D}
        .ap-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px}
        .ap-stat-label{font-size:13px;color:#888;font-weight:500;margin-bottom:4px}
        .ap-stat-value{font-size:28px;font-weight:700;color:#2C2C2C}

        /* Search */
        .ap-search-bar{background:white;border-radius:12px;padding:16px 20px;border:1px solid #E5E5E0;margin-bottom:16px;display:flex;align-items:center;gap:12px}
        .ap-search-wrap{flex:1;display:flex;align-items:center;gap:10px}
        .ap-search-input{width:100%;padding:10px 0;font-size:15px;border:none;outline:none;background:transparent;color:#2C2C2C}
        .ap-search-input::placeholder{color:#bbb}
        .ap-result-count{font-size:13px;color:#888;font-weight:600;white-space:nowrap}

        /* Table */
        .ap-table-wrap{display:block}
        .ap-table{background:white;border-radius:12px;border:1px solid #E5E5E0;overflow:hidden}
        .ap-table-header{display:grid;grid-template-columns:2.2fr 1.2fr 0.8fr 0.8fr 0.8fr 220px;padding:12px 18px;background:#F5F5F0;border-bottom:1px solid #E5E5E0;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px}
        .ap-table-row{display:grid;grid-template-columns:2.2fr 1.2fr 0.8fr 0.8fr 0.8fr 220px;padding:14px 18px;border-bottom:1px solid #f0f0ec;align-items:center;transition:background .1s}
        .ap-table-row:hover{background:#FAFAF8}
        .ap-table-row:last-child{border-bottom:none}

        /* Package cell */
        .ap-cell-pkg{display:flex;align-items:center;gap:12px;min-width:0}
        .ap-pkg-thumb{width:52px;height:52px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:22px;background-size:cover;background-position:center}
        .ap-pkg-thumb.sm{width:44px;height:44px;font-size:18px}
        .ap-pkg-info{min-width:0}
        .ap-pkg-name{font-size:14px;font-weight:600;color:#2C2C2C;margin-bottom:2px;display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ap-star{font-size:13px}
        .ap-pkg-meta{font-size:12px;color:#999}
        .ap-cell{min-width:0}
        .ap-cell-act{display:flex;align-items:center}
        .ap-agency-name{font-size:13px;font-weight:600;color:#2C2C2C}
        .ap-tick{color:#10B981;font-size:13px;margin-left:3px}
        .ap-type-badge{padding:4px 10px;background:rgba(184,147,109,.1);color:#B8936D;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase}
        .ap-price{font-size:15px;font-weight:700;color:#2C2C2C}

        /* ── ACTION BUTTONS — exact same as Guides page ── */
        .ap-actions{display:grid;grid-template-columns:1fr 1fr;gap:4px;width:210px}
        .ap-btn{
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
          transition:filter .15s;
          text-decoration:none;
          white-space:nowrap;
          width:100%;
          font-family:inherit;
        }
        .ap-btn:hover{filter:brightness(0.92)}
        .ap-btn-slate  {background:#E2E8F0;color:#334155}
        .ap-btn-blue   {background:#3B82F6;color:white}
        .ap-btn-green  {background:#10B981;color:white}
        .ap-btn-amber  {background:#F59E0B;color:white}
        .ap-btn-red    {background:#EF4444;color:white}

        /* Cards (mobile) */
        .ap-cards-wrap{display:none}
        .ap-card{background:white;border-radius:12px;border:1px solid #E5E5E0;padding:14px;margin-bottom:8px}
        .ap-card-top{display:flex;align-items:center;gap:12px;margin-bottom:10px}
        .ap-card-info{flex:1;min-width:0}
        .ap-card-row{display:flex;gap:10px;align-items:center;margin-bottom:10px;flex-wrap:wrap;font-size:13px}
        .ap-card-dur{color:#999;font-size:12px;margin-left:auto}
        /* Mobile card actions — same as gp-card-acts in Guides */
        .ap-card-acts{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding-top:10px;border-top:1px solid #f0f0ec}
        .ap-card-acts .ap-actions{width:100%;display:contents}
        .ap-card-acts .ap-btn{height:34px;font-size:12px}

        /* Empty */
        .ap-empty{padding:60px 20px;text-align:center}
        .ap-empty-icon{font-size:40px;margin-bottom:12px}
        .ap-empty-title{font-size:16px;font-weight:600;color:#666;margin-bottom:6px}
        .ap-empty-sub{font-size:14px;color:#999}

        /* Pagination */
        .ap-pagination{display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;flex-wrap:wrap;border-top:1px solid #f0f0ec}
        .ap-pg-btn{padding:8px 16px;background:white;border:1px solid #E5E5E0;border-radius:8px;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;white-space:nowrap}
        .ap-pg-btn:hover:not(:disabled){border-color:#B8936D;color:#B8936D}
        .ap-pg-btn:disabled{opacity:.4;cursor:not-allowed}
        .ap-pg-pages{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
        .ap-pg-num{width:36px;height:36px;border:1px solid #E5E5E0;border-radius:8px;background:white;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
        .ap-pg-num:hover{border-color:#B8936D;color:#B8936D}
        .ap-pg-num.active{background:#B8936D;border-color:#B8936D;color:white}
        .ap-pg-ellipsis{color:#aaa;font-size:13px;padding:0 2px}

        /* Desktop ≥1024px */
        @media(min-width:1024px){
          .ap-title{font-size:28px}
        }

        /* Tablet 640–1023px */
        @media(min-width:640px) and (max-width:1023px){
          .ap-table-header{grid-template-columns:2fr 1fr 0.8fr 0.8fr 210px}
          .ap-table-row   {grid-template-columns:2fr 1fr 0.8fr 0.8fr 210px}
          .ap-table-header>div:nth-child(3),.ap-table-row>div:nth-child(3){display:none}
          .ap-stats-grid{gap:10px}
          .ap-stat-card{padding:14px}
          .ap-stat-value{font-size:24px}
        }

        /* Mobile <640px */
        @media(max-width:639px){
          .ap-table-wrap{display:none}
          .ap-cards-wrap{display:block}
          .ap-stats-grid{grid-template-columns:repeat(2,1fr);gap:8px}
          .ap-stat-card{padding:10px 8px;border-radius:8px}
          .ap-stat-icon{width:32px;height:32px;font-size:15px;margin-bottom:8px}
          .ap-stat-value{font-size:18px}
          .ap-stat-l{font-size:9px}
          .ap-title{font-size:20px}
          .ap-subtitle{font-size:12px;margin-bottom:16px}
          .ap-search-bar{padding:8px 10px;border-radius:8px}
          .ap-search-input{font-size:13px}
          .ap-pg-btn{padding:8px 10px;font-size:12px}
          .ap-pg-num{width:32px;height:32px;font-size:12px}
        }
      `}} />

      <div className="ap">

        {/* HEADER */}
        <h1 className="ap-title">Manage Packages</h1>
        <p className="ap-subtitle">Monitor and moderate all Umrah packages on the platform</p>

        {/* STATS */}
        <div className="ap-stats-grid">
          {statCards.map(c => (
            <div key={c.key} className={`ap-stat-card ${filter === c.key ? 'active' : ''}`} onClick={() => setFilter(c.key)}>
              <div className="ap-stat-icon" style={{ background: c.color + '12' }}>{c.icon}</div>
              <div className="ap-stat-label">{c.label}</div>
              <div className="ap-stat-value">{c.value}</div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="ap-search-bar">
          <div className="ap-search-wrap">
            🔍
            <input
              type="text"
              placeholder="Search package or agency..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="ap-search-input"
            />
          </div>
          <span className="ap-result-count">
            {filtered.length} packages{totalPages > 1 ? ` • Page ${currentPage}/${totalPages}` : ''}
          </span>
        </div>

        {/* TABLE (desktop/tablet) */}
        <div className="ap-table-wrap">
          <div className="ap-table">
            <div className="ap-table-header">
              <div>Package</div>
              <div>Agency</div>
              <div>Type</div>
              <div>Price</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {paginated.map(pkg => (
              <div key={pkg.id} className="ap-table-row">
                {/* Package */}
                <div className="ap-cell-pkg">
                  <div className="ap-pkg-thumb" style={{
                    backgroundImage: pkg.photos?.[0] ? `url(${pkg.photos[0]})` : 'none',
                    backgroundColor: pkg.photos?.[0] ? 'transparent' : '#F5F5F0'
                  }}>
                    {!pkg.photos?.[0] && '🕌'}
                  </div>
                  <div className="ap-pkg-info">
                    <div className="ap-pkg-name">
                      {pkg.title}
                      {pkg.is_featured && <span className="ap-star">⭐</span>}
                    </div>
                    <div className="ap-pkg-meta">{pkg.duration_nights} nights · {pkg.departure_city || 'N/A'}</div>
                  </div>
                </div>

                {/* Agency */}
                <div className="ap-cell">
                  <span className="ap-agency-name">
                    {pkg.agencies?.name || 'N/A'}
                    {pkg.agencies?.is_verified && <span className="ap-tick">✓</span>}
                  </span>
                </div>

                {/* Type */}
                <div className="ap-cell"><span className="ap-type-badge">{pkg.package_type || 'standard'}</span></div>

                {/* Price */}
                <div className="ap-cell"><span className="ap-price">RM {pkg.price_quad?.toLocaleString() || 'N/A'}</span></div>

                {/* Status */}
                <div className="ap-cell">
                  <StatusBadge status={pkg.status as 'draft' | 'published' | 'archived'} />
                </div>

                {/* Actions */}
                <div className="ap-cell-act">
                  <ActionButtons pkg={pkg} onToggleFeatured={handleToggleFeatured} onChangeStatus={handleChangeStatus} onDelete={handleDelete} />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="ap-empty">
                <div className="ap-empty-icon">🔍</div>
                <div className="ap-empty-title">No packages found</div>
                <div className="ap-empty-sub">{searchQuery ? 'Try a different search term' : 'No packages yet'}</div>
              </div>
            )}

            {/* Pagination inside table */}
            {totalPages > 1 && (
              <div className="ap-pagination">
                <button className="ap-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                <div className="ap-pg-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={`e${i}`} className="ap-pg-ellipsis">...</span>
                        : <button key={p} className={`ap-pg-num ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p as number)}>{p}</button>
                    )}
                </div>
                <button className="ap-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
              </div>
            )}
          </div>
        </div>

        {/* CARDS (mobile) */}
        <div className="ap-cards-wrap">
          {paginated.map(pkg => (
            <div key={pkg.id} className="ap-card">
              <div className="ap-card-top">
                <div className="ap-pkg-thumb sm" style={{
                  backgroundImage: pkg.photos?.[0] ? `url(${pkg.photos[0]})` : 'none',
                  backgroundColor: pkg.photos?.[0] ? 'transparent' : '#F5F5F0'
                }}>
                  {!pkg.photos?.[0] && '🕌'}
                </div>
                <div className="ap-card-info">
                  <div className="ap-pkg-name">{pkg.title} {pkg.is_featured && <span className="ap-star">⭐</span>}</div>
                  <div className="ap-pkg-meta">{pkg.agencies?.name || 'N/A'}{pkg.agencies?.is_verified && <span className="ap-tick">✓</span>}</div>
                </div>
                <StatusBadge status={pkg.status as 'draft' | 'published' | 'archived'} />
              </div>
              <div className="ap-card-row">
                <span className="ap-type-badge">{pkg.package_type || 'standard'}</span>
                <span className="ap-price">RM {pkg.price_quad?.toLocaleString() || 'N/A'}</span>
                <span className="ap-card-dur">{pkg.duration_nights} nights</span>
              </div>
              <div className="ap-card-acts">
                <ActionButtons pkg={pkg} onToggleFeatured={handleToggleFeatured} onChangeStatus={handleChangeStatus} onDelete={handleDelete} />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="ap-empty">
              <div className="ap-empty-icon">🔍</div>
              <div className="ap-empty-title">No packages found</div>
              <div className="ap-empty-sub">{searchQuery ? 'Try a different search term' : 'No packages yet'}</div>
            </div>
          )}

          {/* Pagination mobile */}
          {totalPages > 1 && (
            <div className="ap-pagination" style={{ borderTop: 'none' }}>
              <button className="ap-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
              <div className="ap-pg-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={`e${i}`} className="ap-pg-ellipsis">...</span>
                      : <button key={p} className={`ap-pg-num ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p as number)}>{p}</button>
                  )}
              </div>
              <button className="ap-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
            </div>
          )}
        </div>

      </div>
    </>
  )
}