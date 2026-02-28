'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusToggleButton'

/* ── ActionButtons: TOP-LEVEL — same pattern as pakej/agensi pages ── */
function ActionButtons({ post, onToggle, onDelete }: {
  post: any
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string, title: string) => void
}) {
  const displayName = post.title || post.content?.slice(0, 30) + '...' || 'this post'
  return (
    <div className="nf-actions">
      <button
        className={'nf-btn ' + (post.is_active ? 'nf-btn-amber' : 'nf-btn-green')}
        onClick={() => onToggle(post.id, post.is_active)}
      >
        {post.is_active ? '⏸ Unpublish' : '✓ Publish'}
      </button>
      <button
        className="nf-btn nf-btn-red"
        onClick={() => onDelete(post.id, displayName)}
      >
        🗑 Delete
      </button>
    </div>
  )
}

export default function NewsFeedClient({ initialPosts }: { initialPosts: any[] }) {
  const supabase = createClient()
  const [posts, setPosts] = useState(initialPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const agencies = Array.from(new Set(posts.map(p => p.agencies?.name).filter(Boolean)))

  const filtered = posts.filter(post => {
    const matchesSearch = !searchTerm ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && post.is_active) ||
      (statusFilter === 'hidden' && !post.is_active)
    const matchesAgency = agencyFilter === 'all' || post.agencies?.name === agencyFilter
    return matchesSearch && matchesStatus && matchesAgency
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total:       posts.length,
    published:   posts.filter(p => p.is_active).length,
    unpublished: posts.filter(p => !p.is_active).length,
  }

  // Reset page on filter/search change
  const handleSearch = (v: string)  => { setSearchTerm(v);    setCurrentPage(1) }
  const handleStatus = (v: string)  => { setStatusFilter(v as any); setCurrentPage(1) }
  const handleAgency = (v: string)  => { setAgencyFilter(v);  setCurrentPage(1) }

  const handleToggle = async (id: string, current: boolean) => {
    const { error } = await supabase.from('news_feed').update({ is_active: !current }).eq('id', id)
    if (error) { alert('Error updating post status'); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm('Delete "' + title + '"?\n\nThis cannot be undone.')) return
    const { error } = await supabase.from('news_feed').delete().eq('id', id)
    if (error) { alert('Error deleting post'); return }
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div>
      <style>{`
        /* Header */
        .nf-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .nf-sub { font-size: 15px; color: #888; margin: 0 0 24px; }

        /* Stats — clickable filters */
        .nf-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .nf-stat { background: white; border-radius: 12px; padding: 18px; border: 2px solid #E5E5E0; cursor: pointer; transition: all 0.2s; }
        .nf-stat:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .nf-stat.active { border-color: #B8936D; }
        .nf-stat-icon { font-size: 18px; margin-bottom: 8px; }
        .nf-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 4px; }
        .nf-stat-value { font-size: 28px; font-weight: 700; color: #2C2C2C; }

        /* Search + filters */
        .nf-filters { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid #E5E5E0; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
        .nf-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
        .nf-filter-group.search-group { flex: 2; min-width: 220px; }
        .nf-filter-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.4px; }
        .nf-filter-input { padding: 9px 12px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; background: #FAFAF8; color: #2C2C2C; width: 100%; box-sizing: border-box; }
        .nf-filter-input:focus { border-color: #B8936D; background: white; }
        .nf-filter-count { width: 100%; font-size: 13px; color: #888; padding-top: 4px; }

        /* Posts list */
        .nf-list-wrap { background: white; border-radius: 12px; border: 1px solid #E5E5E0; overflow: hidden; }
        .nf-list-header { padding: 16px 20px; border-bottom: 1px solid #E5E5E0; display: flex; align-items: center; justify-content: space-between; }
        .nf-list-title { font-size: 16px; font-weight: 700; color: #2C2C2C; }
        .nf-list-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

        /* Post card */
        .nf-post { padding: 16px; background: #FAFAF8; border-radius: 10px; border: 1px solid #F0F0EC; display: flex; gap: 14px; transition: background 0.15s; }
        .nf-post:hover { background: #F5F5F0; }
        .nf-post-thumb { width: 100px; height: 100px; border-radius: 8px; background-size: cover; background-position: center; flex-shrink: 0; background-color: #E5E5E0; display: flex; align-items: center; justify-content: center; font-size: 28px; }
        .nf-post-body { flex: 1; min-width: 0; }
        .nf-post-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
        .nf-post-agency { font-size: 13px; font-weight: 700; color: #2C2C2C; }
        .nf-post-date { font-size: 11px; color: #aaa; margin-top: 1px; }
        .nf-post-title { font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .nf-post-content { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .nf-post-img-count { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: #EFF6FF; border-radius: 4px; font-size: 11px; color: #3B82F6; font-weight: 600; margin-bottom: 8px; }

        /* ── ACTION BUTTONS — same system as pakej/agensi ── */
        .nf-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; max-width: 220px; }
        .nf-btn {
          height: 30px;
          padding: 0 10px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          transition: filter 0.15s;
          white-space: nowrap;
          width: 100%;
          font-family: inherit;
        }
        .nf-btn:hover { filter: brightness(0.92); }
        .nf-btn-green  { background: #10B981; color: white; }
        .nf-btn-amber  { background: #F59E0B; color: white; }
        .nf-btn-red    { background: #EF4444; color: white; }

        /* Pagination */
        .nf-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; flex-wrap: wrap; border-top: 1px solid #f0f0ec; }
        .nf-pg-btn { padding: 8px 16px; background: white; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .nf-pg-btn:hover:not(:disabled) { border-color: #B8936D; color: #B8936D; }
        .nf-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
        .nf-pg-pages { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        .nf-pg-num { width: 36px; height: 36px; border: 1px solid #E5E5E0; border-radius: 8px; background: white; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
        .nf-pg-num:hover { border-color: #B8936D; color: #B8936D; }
        .nf-pg-num.active { background: #B8936D; border-color: #B8936D; color: white; }
        .nf-pg-ellipsis { color: #aaa; font-size: 13px; padding: 0 2px; }

        /* Empty */
        .nf-empty { padding: 60px 24px; text-align: center; }
        .nf-empty-icon { font-size: 44px; margin-bottom: 12px; }
        .nf-empty-title { font-size: 16px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .nf-empty-sub { font-size: 14px; color: #999; }

        /* Responsive */
        @media (max-width: 1023px) {
          .nf-stats { gap: 10px; }
          .nf-stat { padding: 14px; }
          .nf-stat-value { font-size: 24px; }
        }
        @media (max-width: 767px) {
          .nf-stats { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .nf-stat { padding: 12px; }
          .nf-stat-icon { font-size: 15px; margin-bottom: 6px; }
          .nf-stat-value { font-size: 22px; }
          .nf-filter-group { min-width: 100%; }
          .nf-post { gap: 10px; }
          .nf-post-thumb { width: 72px; height: 72px; font-size: 22px; }
          .nf-actions { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .nf-title { font-size: 22px; }
          .nf-stats { gap: 6px; }
          .nf-stat { padding: 10px; }
          .nf-stat-value { font-size: 20px; }
          .nf-stat-label { font-size: 11px; }
          .nf-post { flex-direction: column; }
          .nf-post-thumb { width: 100%; height: 160px; }
          .nf-pg-btn { padding: 8px 10px; font-size: 12px; }
          .nf-pg-num { width: 32px; height: 32px; font-size: 12px; }
        }
      `}</style>

      {/* HEADER */}
      <h1 className="nf-title">News Feed Management</h1>
      <p className="nf-sub">Monitor and moderate agency news feed posts</p>

      {/* STATS — clickable filters */}
      <div className="nf-stats">
        {[
          { key: 'all',    icon: '📰', label: 'Total Posts',   value: stats.total,       color: '#3B82F6' },
          { key: 'active', icon: '✅', label: 'Published',     value: stats.published,   color: '#10B981' },
          { key: 'hidden', icon: '📤', label: 'Unpublished',   value: stats.unpublished, color: '#F59E0B' },
        ].map(s => (
          <div
            key={s.key}
            className={'nf-stat' + (statusFilter === s.key || (s.key === 'all' && statusFilter === 'all') ? ' active' : '')}
            onClick={() => handleStatus(s.key)}
          >
            <div className="nf-stat-icon">{s.icon}</div>
            <div className="nf-stat-label">{s.label}</div>
            <div className="nf-stat-value" style={{ color: s.value > 0 ? s.color : '#2C2C2C' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="nf-filters">
        <div className="nf-filter-group search-group">
          <label className="nf-filter-label">🔍 Search</label>
          <input
            type="text"
            placeholder="Search content, title, agency..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="nf-filter-input"
          />
        </div>
        <div className="nf-filter-group">
          <label className="nf-filter-label">Agency</label>
          <select value={agencyFilter} onChange={e => handleAgency(e.target.value)} className="nf-filter-input">
            <option value="all">All Agencies</option>
            {agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="nf-filter-count">
          Showing <strong>{filtered.length}</strong> of <strong>{posts.length}</strong> posts
          {totalPages > 1 && <> • Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong></>}
        </div>
      </div>

      {/* POSTS LIST */}
      <div className="nf-list-wrap">
        <div className="nf-list-header">
          <div className="nf-list-title">Posts</div>
          <span style={{ fontSize: 13, color: '#888' }}>{filtered.length} results</span>
        </div>

        {filtered.length === 0 ? (
          <div className="nf-empty">
            <div className="nf-empty-icon">📰</div>
            <div className="nf-empty-title">
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'No posts match your filters' : 'No posts yet'}
            </div>
            <div className="nf-empty-sub">
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'Try adjusting your search or filters' : 'Agency posts will appear here'}
            </div>
          </div>
        ) : (
          <>
            <div className="nf-list-body">
              {paginated.map((post: any) => {
                const firstImage = Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : null
                return (
                  <div key={post.id} className="nf-post">
                    <div
                      className="nf-post-thumb"
                      style={{ backgroundImage: firstImage ? 'url(' + firstImage + ')' : 'none' }}
                    >
                      {!firstImage && '📄'}
                    </div>
                    <div className="nf-post-body">
                      <div className="nf-post-top">
                        <div>
                          <div className="nf-post-agency">{post.agencies?.name || 'Unknown Agency'}</div>
                          <div className="nf-post-date">
                            {new Date(post.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <StatusBadge status={post.is_active ? 'published' : 'draft'} />
                      </div>

                      {post.title && <div className="nf-post-title">{post.title}</div>}
                      <div className="nf-post-content">{post.content}</div>

                      {Array.isArray(post.images) && post.images.length > 0 && (
                        <div className="nf-post-img-count">
                          📷 {post.images.length} {post.images.length === 1 ? 'image' : 'images'}
                        </div>
                      )}

                      <ActionButtons post={post} onToggle={handleToggle} onDelete={handleDelete} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="nf-pagination">
                <button className="nf-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                <div className="nf-pg-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={'e' + i} className="nf-pg-ellipsis">...</span>
                        : <button key={p} className={'nf-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                    )}
                </div>
                <button className="nf-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}