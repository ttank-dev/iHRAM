'use client'

import { useState } from 'react'
import ReelsActions from './ReelsActions'

export default function ReelsClient({ initialReels }: { initialReels: any[] }) {
  const [reels] = useState(initialReels)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [playingReel, setPlayingReel] = useState<any>(null)

  const agencies = Array.from(new Set(reels.map(r => r.agencies?.name).filter(Boolean)))

  const filteredReels = reels.filter(reel => {
    const matchesSearch = !searchTerm ||
      reel.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && reel.is_active) ||
      (statusFilter === 'hidden' && !reel.is_active)
    const matchesAgency = agencyFilter === 'all' || reel.agencies?.name === agencyFilter
    return matchesSearch && matchesStatus && matchesAgency
  })

  const stats = {
    total: reels.length,
    published: reels.filter(r => r.is_active).length,
    unpublished: reels.filter(r => !r.is_active).length
  }

  return (
    <div>
      <style>{`
        .rl-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .rl-sub { font-size: 16px; color: #666; margin-bottom: 32px; }

        /* Stats */
        .rl-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .rl-stat { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; }
        .rl-stat-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 8px; }
        .rl-stat-value { font-size: 32px; font-weight: bold; }

        /* Filters */
        .rl-filters { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; margin-bottom: 24px; }
        .rl-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }
        .rl-filter-label { display: block; font-size: 13px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .rl-filter-input { width: 100%; padding: 10px 16px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
        .rl-filter-count { margin-top: 16px; font-size: 14px; color: #666; }

        /* Grid wrap */
        .rl-grid-wrap { background: white; border-radius: 16px; border: 1px solid #E5E5E0; overflow: hidden; }
        .rl-grid-header { padding: 24px; border-bottom: 1px solid #E5E5E0; }
        .rl-grid-title { font-size: 20px; font-weight: bold; color: #2C2C2C; }
        .rl-grid { padding: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

        /* Reel card */
        .rl-card { background: #F5F5F0; border-radius: 12px; overflow: hidden; position: relative; }
        .rl-thumb { width: 100%; padding-bottom: 177.78%; position: relative; background: #1A1A1A; cursor: pointer; }
        .rl-thumb-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; }
        .rl-thumb-empty { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; }
        .rl-badge { position: absolute; top: 8px; right: 8px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: white; }
        .rl-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer; }
        .rl-card-info { padding: 12px; }
        .rl-card-agency { font-size: 13px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rl-card-title { font-size: 12px; color: #666; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rl-card-date { font-size: 12px; color: #999; margin-bottom: 8px; }

        /* Empty */
        .rl-empty { padding: 60px 24px; text-align: center; }

        /* Modal */
        .rl-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; }
        .rl-modal-inner { max-width: 420px; width: 90%; background: #000; border-radius: 16px; overflow: hidden; position: relative; cursor: default; }
        .rl-modal-close { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; font-size: 18px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .rl-modal-info { padding: 16px; background: #1A1A1A; color: white; }
        .rl-modal-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .rl-modal-meta { font-size: 12px; color: #999; display: flex; gap: 12px; }

        /* ── TABLET ── */
        @media (max-width: 1023px) {
          .rl-title { font-size: 26px; }
          .rl-stats { gap: 14px; }
          .rl-stat { padding: 18px; }
          .rl-stat-value { font-size: 26px; }
          .rl-filter-grid { grid-template-columns: 1fr 1fr; }
          .rl-filter-grid > :first-child { grid-column: 1 / -1; }
          .rl-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }

        /* ── MOBILE ── */
        @media (max-width: 639px) {
          .rl-title { font-size: 22px; }
          .rl-sub { font-size: 14px; margin-bottom: 20px; }

          .rl-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .rl-stats > :last-child { grid-column: 1 / -1; }
          .rl-stat { padding: 14px; }
          .rl-stat-label { font-size: 12px; margin-bottom: 4px; }
          .rl-stat-value { font-size: 24px; }

          .rl-filters { padding: 16px; }
          .rl-filter-grid { grid-template-columns: 1fr; gap: 12px; }
          .rl-filter-grid > :first-child { grid-column: auto; }

          .rl-grid-header { padding: 16px; }
          .rl-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; }
          .rl-play { width: 44px; height: 44px; font-size: 20px; }
        }
      `}</style>

      <h1 className="rl-title">Reels Management</h1>
      <p className="rl-sub">Moderate agency reels and short videos</p>

      {/* Stats */}
      <div className="rl-stats">
        {[
          { label: 'Total Reels', value: stats.total, color: '#2C2C2C' },
          { label: 'Published', value: stats.published, color: '#10B981' },
          { label: 'Unpublished', value: stats.unpublished, color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} className="rl-stat">
            <div className="rl-stat-label">{s.label}</div>
            <div className="rl-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rl-filters">
        <div className="rl-filter-grid">
          <div>
            <label className="rl-filter-label">🔍 Search</label>
            <input type="text" placeholder="Search title or agency..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="rl-filter-input" />
          </div>
          <div>
            <label className="rl-filter-label">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rl-filter-input" style={{ cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="active">✅ Published</option>
              <option value="hidden">📤 Unpublished</option>
            </select>
          </div>
          <div>
            <label className="rl-filter-label">Agency</label>
            <select value={agencyFilter} onChange={(e) => setAgencyFilter(e.target.value)} className="rl-filter-input" style={{ cursor: 'pointer' }}>
              <option value="all">All Agencies</option>
              {agencies.map(agency => <option key={agency} value={agency}>{agency}</option>)}
            </select>
          </div>
        </div>
        <div className="rl-filter-count">
          Showing <strong>{filteredReels.length}</strong> of <strong>{reels.length}</strong> reels
        </div>
      </div>

      {/* Reels Grid */}
      <div className="rl-grid-wrap">
        <div className="rl-grid-header">
          <div className="rl-grid-title">Reels</div>
        </div>

        {filteredReels.length === 0 ? (
          <div className="rl-empty">
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'No reels match your filters' : 'No Reels Yet'}
            </div>
            <div style={{ fontSize: '15px', color: '#666' }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'Try adjusting your search or filters' : 'Agency reels will appear here'}
            </div>
          </div>
        ) : (
          <div className="rl-grid">
            {filteredReels.map((reel: any) => (
              <div key={reel.id} className="rl-card">
                <div className="rl-thumb" onClick={() => setPlayingReel(reel)}>
                  {reel.thumbnail_url ? (
                    <div className="rl-thumb-bg" style={{ backgroundImage: `url(${reel.thumbnail_url})` }} />
                  ) : (
                    <div className="rl-thumb-empty">🎬</div>
                  )}
                  <div className="rl-badge" style={{ backgroundColor: reel.is_active ? '#10B981' : '#F59E0B' }}>
                    {reel.is_active ? '✅ Published' : '📤 Unpublished'}
                  </div>
                  <div className="rl-play">▶️</div>
                </div>
                <div className="rl-card-info">
                  <div className="rl-card-agency">{reel.agencies?.name || 'Unknown'}</div>
                  {reel.title && <div className="rl-card-title">{reel.title}</div>}
                  <div className="rl-card-date">
                    {new Date(reel.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })}
                  </div>
                  <ReelsActions reel={reel} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {playingReel && (
        <div className="rl-modal-overlay" onClick={() => setPlayingReel(null)}>
          <div className="rl-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="rl-modal-close" onClick={() => setPlayingReel(null)}>✕</button>
            <video src={playingReel.video_url} controls autoPlay playsInline
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', display: 'block' }} />
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