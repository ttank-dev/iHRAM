'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusToggleButton'

/* ── ActionButtons: TOP-LEVEL — same pattern as all admin pages ── */
function ActionButtons({ reel, onToggle, onDelete }: {
  reel: any
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string, title: string) => void
}) {
  const displayName = reel.title || 'this reel'
  return (
    <div className="rl-actions">
      <button
        className={'rl-btn ' + (reel.is_active ? 'rl-btn-amber' : 'rl-btn-green')}
        onClick={() => onToggle(reel.id, reel.is_active)}
      >
        {reel.is_active ? '⏸ Unpublish' : '✓ Publish'}
      </button>
      <button
        className="rl-btn rl-btn-red"
        onClick={() => onDelete(reel.id, displayName)}
      >
        🗑 Delete
      </button>
    </div>
  )
}

export default function ReelsClient({ initialReels }: { initialReels: any[] }) {
  const supabase = createClient()
  const [reels, setReels] = useState(initialReels)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [playingReel, setPlayingReel] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12 // grid layout — multiple of 4

  const agencies = Array.from(new Set(reels.map(r => r.agencies?.name).filter(Boolean)))

  const filtered = reels.filter(reel => {
    const matchesSearch = !searchTerm ||
      reel.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && reel.is_active) ||
      (statusFilter === 'hidden' && !reel.is_active)
    const matchesAgency = agencyFilter === 'all' || reel.agencies?.name === agencyFilter
    return matchesSearch && matchesStatus && matchesAgency
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total:       reels.length,
    published:   reels.filter(r => r.is_active).length,
    unpublished: reels.filter(r => !r.is_active).length,
  }

  const handleSearch = (v: string) => { setSearchTerm(v);            setCurrentPage(1) }
  const handleStatus = (v: string) => { setStatusFilter(v as any);   setCurrentPage(1) }
  const handleAgency = (v: string) => { setAgencyFilter(v);          setCurrentPage(1) }

  const handleToggle = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reels').update({ is_active: !current }).eq('id', id)
    if (error) { alert('Error updating reel status'); return }
    setReels(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r))
    // update modal if currently playing
    if (playingReel?.id === id) setPlayingReel((r: any) => ({ ...r, is_active: !current }))
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm('Delete "' + title + '"?\n\nThis cannot be undone.')) return
    const { error } = await supabase.from('reels').delete().eq('id', id)
    if (error) { alert('Error deleting reel'); return }
    setReels(prev => prev.filter(r => r.id !== id))
    if (playingReel?.id === id) setPlayingReel(null)
  }

  return (
    <div>
      <style>{`
        .rl-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .rl-sub { font-size: 15px; color: #888; margin: 0 0 24px; }

        /* Stats */
        .rl-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .rl-stat { background: white; border-radius: 12px; padding: 18px; border: 2px solid #E5E5E0; cursor: pointer; transition: all 0.2s; }
        .rl-stat:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .rl-stat.active { border-color: #B8936D; }
        .rl-stat-icon { font-size: 18px; margin-bottom: 8px; }
        .rl-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 4px; }
        .rl-stat-value { font-size: 28px; font-weight: 700; color: #2C2C2C; }

        /* Filters */
        .rl-filters { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid #E5E5E0; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
        .rl-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
        .rl-filter-group.search-group { flex: 2; min-width: 220px; }
        .rl-filter-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.4px; }
        .rl-filter-input { padding: 9px 12px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; background: #FAFAF8; color: #2C2C2C; width: 100%; box-sizing: border-box; }
        .rl-filter-input:focus { border-color: #B8936D; background: white; }
        .rl-filter-count { width: 100%; font-size: 13px; color: #888; padding-top: 4px; }

        /* Grid wrap */
        .rl-grid-wrap { background: white; border-radius: 12px; border: 1px solid #E5E5E0; overflow: hidden; }
        .rl-grid-header { padding: 16px 20px; border-bottom: 1px solid #E5E5E0; display: flex; align-items: center; justify-content: space-between; }
        .rl-grid-title { font-size: 16px; font-weight: 700; color: #2C2C2C; }
        .rl-grid { padding: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

        /* Reel card */
        .rl-card { background: #F5F5F0; border-radius: 10px; overflow: hidden; border: 1px solid #EBEBEB; }
        .rl-thumb { width: 100%; padding-bottom: 177.78%; position: relative; background: #1A1A1A; cursor: pointer; }
        .rl-thumb-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; }
        .rl-thumb-empty { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .rl-thumb-badge { position: absolute; top: 7px; right: 7px; }
        .rl-play-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.92); display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; transition: transform 0.15s; }
        .rl-thumb:hover .rl-play-btn { transform: translate(-50%,-50%) scale(1.1); }
        .rl-card-info { padding: 10px 12px 12px; }
        .rl-card-agency { font-size: 13px; font-weight: 700; color: #2C2C2C; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rl-card-title { font-size: 12px; color: #666; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rl-card-date { font-size: 11px; color: #aaa; margin-bottom: 8px; }

        /* ── ACTION BUTTONS — same system as all admin pages ── */
        .rl-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .rl-btn {
          height: 28px;
          padding: 0 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          transition: filter 0.15s;
          white-space: nowrap;
          width: 100%;
          font-family: inherit;
        }
        .rl-btn:hover { filter: brightness(0.92); }
        .rl-btn-green  { background: #10B981; color: white; }
        .rl-btn-amber  { background: #F59E0B; color: white; }
        .rl-btn-red    { background: #EF4444; color: white; }

        /* Pagination */
        .rl-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; flex-wrap: wrap; border-top: 1px solid #f0f0ec; }
        .rl-pg-btn { padding: 8px 16px; background: white; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .rl-pg-btn:hover:not(:disabled) { border-color: #B8936D; color: #B8936D; }
        .rl-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
        .rl-pg-pages { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        .rl-pg-num { width: 36px; height: 36px; border: 1px solid #E5E5E0; border-radius: 8px; background: white; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
        .rl-pg-num:hover { border-color: #B8936D; color: #B8936D; }
        .rl-pg-num.active { background: #B8936D; border-color: #B8936D; color: white; }
        .rl-pg-ellipsis { color: #aaa; font-size: 13px; padding: 0 2px; }

        /* Modal */
        .rl-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; }
        .rl-modal-inner { max-width: 420px; width: 90%; background: #000; border-radius: 16px; overflow: hidden; position: relative; cursor: default; }
        .rl-modal-close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; font-size: 18px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .rl-modal-info { padding: 16px; background: #1A1A1A; color: white; }
        .rl-modal-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .rl-modal-meta { font-size: 12px; color: #999; display: flex; gap: 12px; }

        /* Empty */
        .rl-empty { padding: 60px 24px; text-align: center; }
        .rl-empty-icon { font-size: 44px; margin-bottom: 12px; }
        .rl-empty-title { font-size: 16px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .rl-empty-sub { font-size: 14px; color: #999; }

        /* Responsive */
        @media (max-width: 1023px) {
          .rl-stats { gap: 10px; }
          .rl-stat { padding: 14px; }
          .rl-stat-value { font-size: 24px; }
          .rl-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
        }
        @media (max-width: 767px) {
          .rl-stats { gap: 8px; }
          .rl-stat { padding: 12px; }
          .rl-stat-icon { font-size: 15px; margin-bottom: 6px; }
          .rl-stat-value { font-size: 22px; }
          .rl-filter-group { min-width: 100%; }
          .rl-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px; }
        }
        @media (max-width: 480px) {
          .rl-title { font-size: 22px; }
          .rl-stat-value { font-size: 20px; }
          .rl-stat-label { font-size: 11px; }
          .rl-play-btn { width: 40px; height: 40px; font-size: 18px; }
          .rl-pg-btn { padding: 8px 10px; font-size: 12px; }
          .rl-pg-num { width: 32px; height: 32px; font-size: 12px; }
        }
      `}</style>

      {/* HEADER */}
      <h1 className="rl-title">Reels Management</h1>
      <p className="rl-sub">Monitor and moderate agency reels and short videos</p>

      {/* STATS — clickable filters */}
      <div className="rl-stats">
        {[
          { key: 'all',    icon: '🎬', label: 'Total Reels',  value: stats.total,       color: '#3B82F6' },
          { key: 'active', icon: '✅', label: 'Published',    value: stats.published,   color: '#10B981' },
          { key: 'hidden', icon: '📤', label: 'Unpublished',  value: stats.unpublished, color: '#F59E0B' },
        ].map(s => (
          <div
            key={s.key}
            className={'rl-stat' + (statusFilter === s.key ? ' active' : '')}
            onClick={() => handleStatus(s.key)}
          >
            <div className="rl-stat-icon">{s.icon}</div>
            <div className="rl-stat-label">{s.label}</div>
            <div className="rl-stat-value" style={{ color: s.value > 0 ? s.color : '#2C2C2C' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="rl-filters">
        <div className="rl-filter-group search-group">
          <label className="rl-filter-label">🔍 Search</label>
          <input
            type="text"
            placeholder="Search title or agency..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="rl-filter-input"
          />
        </div>
        <div className="rl-filter-group">
          <label className="rl-filter-label">Agency</label>
          <select value={agencyFilter} onChange={e => handleAgency(e.target.value)} className="rl-filter-input">
            <option value="all">All Agencies</option>
            {agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="rl-filter-count">
          Showing <strong>{filtered.length}</strong> of <strong>{reels.length}</strong> reels
          {totalPages > 1 && <> • Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong></>}
        </div>
      </div>

      {/* REELS GRID */}
      <div className="rl-grid-wrap">
        <div className="rl-grid-header">
          <div className="rl-grid-title">Reels</div>
          <span style={{ fontSize: 13, color: '#888' }}>{filtered.length} results</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rl-empty">
            <div className="rl-empty-icon">🎬</div>
            <div className="rl-empty-title">
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'No reels match your filters' : 'No reels yet'}
            </div>
            <div className="rl-empty-sub">
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'Try adjusting your search or filters' : 'Agency reels will appear here'}
            </div>
          </div>
        ) : (
          <>
            <div className="rl-grid">
              {paginated.map((reel: any) => (
                <div key={reel.id} className="rl-card">
                  <div className="rl-thumb" onClick={() => setPlayingReel(reel)}>
                    {reel.thumbnail_url ? (
                      <div className="rl-thumb-bg" style={{ backgroundImage: 'url(' + reel.thumbnail_url + ')' }} />
                    ) : (
                      <div className="rl-thumb-empty">🎬</div>
                    )}
                    <div className="rl-thumb-badge">
                      <StatusBadge status={reel.is_active ? 'published' : 'draft'} />
                    </div>
                    <div className="rl-play-btn">▶</div>
                  </div>
                  <div className="rl-card-info">
                    <div className="rl-card-agency">{reel.agencies?.name || 'Unknown'}</div>
                    {reel.title && <div className="rl-card-title">{reel.title}</div>}
                    <div className="rl-card-date">
                      {new Date(reel.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <ActionButtons reel={reel} onToggle={handleToggle} onDelete={handleDelete} />
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="rl-pagination">
                <button className="rl-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                <div className="rl-pg-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={'e' + i} className="rl-pg-ellipsis">...</span>
                        : <button key={p} className={'rl-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                    )}
                </div>
                <button className="rl-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* VIDEO MODAL */}
      {playingReel && (
        <div className="rl-modal-overlay" onClick={() => setPlayingReel(null)}>
          <div className="rl-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="rl-modal-close" onClick={() => setPlayingReel(null)}>✕</button>
            <video
              src={playingReel.video_url}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', display: 'block' }}
            />
            <div className="rl-modal-info">
              <div className="rl-modal-title">{playingReel.title || 'Untitled'}</div>
              <div className="rl-modal-meta">
                <span>{playingReel.agencies?.name || 'Unknown Agency'}</span>
                <span>{playingReel.is_active ? '✅ Published' : '📤 Unpublished'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}