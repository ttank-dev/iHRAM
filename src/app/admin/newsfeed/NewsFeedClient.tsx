'use client'

import { useState } from 'react'
import NewsFeedActions from './NewsFeedActions'

export default function NewsFeedClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts] = useState(initialPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')

  const agencies = Array.from(new Set(posts.map(p => p.agencies?.name).filter(Boolean)))

  const filteredPosts = posts.filter(post => {
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

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.is_active).length,
    unpublished: posts.filter(p => !p.is_active).length
  }

  return (
    <div>
      <style>{`
        /* Header */
        .nf-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .nf-sub { font-size: 16px; color: #666; margin-bottom: 32px; }

        /* Stats */
        .nf-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .nf-stat { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; }
        .nf-stat-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 8px; }
        .nf-stat-value { font-size: 32px; font-weight: bold; }

        /* Filters */
        .nf-filters { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; margin-bottom: 24px; }
        .nf-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }
        .nf-filter-label { display: block; font-size: 13px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .nf-filter-input {
          width: 100%; padding: 10px 16px; border: 1px solid #E5E5E0;
          border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;
        }
        .nf-filter-count { margin-top: 16px; font-size: 14px; color: #666; }

        /* Posts list wrap */
        .nf-list-wrap { background: white; border-radius: 16px; border: 1px solid #E5E5E0; overflow: hidden; }
        .nf-list-header { padding: 24px; border-bottom: 1px solid #E5E5E0; }
        .nf-list-title { font-size: 20px; font-weight: bold; color: #2C2C2C; }
        .nf-list-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

        /* Post card */
        .nf-post { padding: 20px; background: #F5F5F0; border-radius: 12px; display: flex; gap: 16px; }
        .nf-post-img { width: 160px; height: 160px; border-radius: 8px; background-size: cover; background-position: center; flex-shrink: 0; border: 1px solid #E5E5E0; }
        .nf-post-body { flex: 1; min-width: 0; }
        .nf-post-meta { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px; }
        .nf-post-agency { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .nf-post-date { font-size: 13px; color: #999; }
        .nf-post-badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
        .nf-post-ttl { font-size: 16px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .nf-post-content { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 8px; }
        .nf-post-img-badge { display: inline-block; padding: 4px 8px; background: #E3F2FD; border-radius: 4px; font-size: 12px; color: #2196F3; margin-bottom: 12px; }

        /* Empty */
        .nf-empty { padding: 60px 24px; text-align: center; }

        /* ── TABLET ── */
        @media (max-width: 1023px) {
          .nf-title { font-size: 26px; }
          .nf-stats { gap: 14px; }
          .nf-stat { padding: 18px; }
          .nf-stat-value { font-size: 26px; }
          .nf-filter-grid { grid-template-columns: 1fr 1fr; }
          .nf-filter-grid > :first-child { grid-column: 1 / -1; }
          .nf-post-img { width: 120px; height: 120px; }
        }

        /* ── MOBILE ── */
        @media (max-width: 639px) {
          .nf-title { font-size: 22px; }
          .nf-sub { font-size: 14px; margin-bottom: 20px; }

          .nf-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .nf-stats > :last-child { grid-column: 1 / -1; }
          .nf-stat { padding: 14px; }
          .nf-stat-label { font-size: 12px; margin-bottom: 4px; }
          .nf-stat-value { font-size: 24px; }

          .nf-filters { padding: 16px; }
          .nf-filter-grid { grid-template-columns: 1fr; gap: 12px; }
          .nf-filter-grid > :first-child { grid-column: auto; }

          .nf-list-header { padding: 16px; }
          .nf-list-body { padding: 16px; gap: 12px; }

          /* Mobile post — stack image on top */
          .nf-post { flex-direction: column; gap: 12px; padding: 14px; }
          .nf-post-img { width: 100%; height: 180px; }
          .nf-post-meta { flex-wrap: wrap; }
          .nf-post-agency { font-size: 14px; }
          .nf-post-ttl { font-size: 15px; }
          .nf-post-content { font-size: 13px; }
        }
      `}</style>

      {/* Header */}
      <h1 className="nf-title">News Feed Management</h1>
      <p className="nf-sub">Moderate agency news feed posts</p>

      {/* Stats */}
      <div className="nf-stats">
        {[
          { label: 'Total Posts', value: stats.total, color: '#2C2C2C' },
          { label: 'Published', value: stats.published, color: '#10B981' },
          { label: 'Unpublished', value: stats.unpublished, color: '#F59E0B' },
        ].map((s) => (
          <div key={s.label} className="nf-stat">
            <div className="nf-stat-label">{s.label}</div>
            <div className="nf-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="nf-filters">
        <div className="nf-filter-grid">
          <div>
            <label className="nf-filter-label">🔍 Search</label>
            <input type="text" placeholder="Search content or agency..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="nf-filter-input" />
          </div>
          <div>
            <label className="nf-filter-label">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="nf-filter-input" style={{ cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="active">✅ Published</option>
              <option value="hidden">📤 Unpublished</option>
            </select>
          </div>
          <div>
            <label className="nf-filter-label">Agency</label>
            <select value={agencyFilter} onChange={(e) => setAgencyFilter(e.target.value)} className="nf-filter-input" style={{ cursor: 'pointer' }}>
              <option value="all">All Agencies</option>
              {agencies.map(agency => <option key={agency} value={agency}>{agency}</option>)}
            </select>
          </div>
        </div>
        <div className="nf-filter-count">
          Showing <strong>{filteredPosts.length}</strong> of <strong>{posts.length}</strong> posts
        </div>
      </div>

      {/* Posts List */}
      <div className="nf-list-wrap">
        <div className="nf-list-header">
          <div className="nf-list-title">News Feed Posts</div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="nf-empty">
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📰</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'No posts match your filters' : 'No News Feed Posts Yet'}
            </div>
            <div style={{ fontSize: '15px', color: '#666' }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'Try adjusting your search or filters' : 'Agency posts will appear here'}
            </div>
          </div>
        ) : (
          <div className="nf-list-body">
            {filteredPosts.map((post: any) => {
              const firstImage = post.images && Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : null
              return (
                <div key={post.id} className="nf-post">
                  {firstImage && (
                    <div className="nf-post-img" style={{ backgroundImage: `url(${firstImage})` }} />
                  )}
                  <div className="nf-post-body">
                    <div className="nf-post-meta">
                      <div>
                        <div className="nf-post-agency">{post.agencies?.name || 'Unknown Agency'}</div>
                        <div className="nf-post-date">
                          {new Date(post.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className="nf-post-badge" style={{
                        backgroundColor: post.is_active ? '#ECFDF5' : '#FEF3C7',
                        color: post.is_active ? '#10B981' : '#D97706'
                      }}>
                        {post.is_active ? '✅ Published' : '📤 Unpublished'}
                      </span>
                    </div>

                    {post.title && <h3 className="nf-post-ttl">{post.title}</h3>}
                    <p className="nf-post-content">{post.content}</p>

                    {post.images && post.images.length > 0 && (
                      <div className="nf-post-img-badge">
                        📷 {post.images.length} {post.images.length === 1 ? 'image' : 'images'}
                      </div>
                    )}

                    <NewsFeedActions post={post} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}